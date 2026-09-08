import logging
from typing import Optional, Dict, List, Any
from app.ai.schemas import CurriculumAnalysisResult
from app.ai.providers.base import BaseAIProvider, AIProviderError, AIProviderUnavailableError
from app.ai.providers.gemini_provider import GeminiProvider
from app.ai.providers.ollama_provider import OllamaProvider
from app.ai.providers.offline_heuristic_provider import OfflineHeuristicProvider

logger = logging.getLogger("omnidesk.ai.service")


class AIService:
    """
    Central AI orchestration service for Omnidesk BD.
    Manages intelligent multi-tier provider cascade:
    1. Gemini Free-Tier (Cloud, fast, structured)
    2. Ollama Local Daemon (Self-hosted, private, offline-first)
    3. Offline Heuristic Engine (Deterministic NLP, guaranteed 100% offline fallback)

    Ensures zero failure rate and strict adherence to the No-Paid-Dependency principle.
    """

    def __init__(
        self,
        providers: Optional[Dict[str, BaseAIProvider]] = None,
        default_priority: Optional[List[str]] = None
    ):
        if providers is not None:
            self._providers = providers
        else:
            self._providers = {
                "gemini": GeminiProvider(),
                "ollama": OllamaProvider(),
                "offline_heuristic": OfflineHeuristicProvider(),
            }

        self._priority = default_priority or ["gemini", "ollama", "offline_heuristic"]

    @property
    def registered_providers(self) -> List[str]:
        """List of all registered provider names."""
        return list(self._providers.keys())

    def get_available_providers(self) -> List[str]:
        """List providers currently reachable and configured."""
        available = []
        for name, provider in self._providers.items():
            try:
                if provider.is_available():
                    available.append(name)
            except Exception:
                pass
        return available

    def register_provider(self, provider: BaseAIProvider) -> None:
        """Register or override an AI provider."""
        self._providers[provider.name] = provider
        if provider.name not in self._priority:
            self._priority.insert(0, provider.name)

    def analyze_curriculum(
        self,
        text: str,
        title: Optional[str] = None,
        preferred_provider: Optional[str] = None,
        **kwargs: Any
    ) -> CurriculumAnalysisResult:
        """
        Extract structured curriculum from parsed text using provider cascade.
        Guaranteed to return a valid CurriculumAnalysisResult via offline fallback.
        """
        if not text or not text.strip():
            raise ValueError("Curriculum extraction requires non-empty source text.")

        order = list(self._priority)
        if preferred_provider and preferred_provider in self._providers:
            order.remove(preferred_provider)
            order.insert(0, preferred_provider)

        last_error: Optional[Exception] = None

        for provider_name in order:
            provider = self._providers.get(provider_name)
            if not provider:
                continue

            try:
                if not provider.is_available():
                    logger.debug("Provider '%s' reported not available; skipping.", provider_name)
                    continue

                logger.info("Attempting curriculum extraction via provider: %s", provider_name)
                result = provider.extract_curriculum(text=text, title=title, **kwargs)
                logger.info(
                    "Curriculum extracted successfully via '%s': %d topics, %d min total",
                    provider_name,
                    len(result.topics),
                    result.total_estimated_minutes
                )
                return result

            except (AIProviderUnavailableError, AIProviderError) as prov_err:
                logger.warning("Provider '%s' failed (%s). Cascading to next provider...", provider_name, prov_err)
                last_error = prov_err
                continue
            except Exception as unhandled:
                logger.error("Unexpected error in provider '%s': %s", provider_name, unhandled, exc_info=True)
                last_error = unhandled
                continue

        # If we exhausted everything, force offline heuristic directly as ultimate safety net
        logger.warning("All cascading providers failed. Falling back to offline heuristic emergency executor.")
        fallback = self._providers.get("offline_heuristic") or OfflineHeuristicProvider()
        return fallback.extract_curriculum(text=text, title=title, **kwargs)


# Global singleton instance for app-wide dependency injection
ai_service = AIService()
