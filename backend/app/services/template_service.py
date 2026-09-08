import json
import os
import logging
from typing import List, Dict, Any, Optional
from pathlib import Path

logger = logging.getLogger("omnidesk.templates")


class TemplateService:
    """
    Service for discovering, inspecting, and loading predefined curriculum templates.
    Serves as an instant, reliable offline alternative to AI-generated curricula.
    """

    def __init__(self, registry_dir: Optional[str] = None):
        if registry_dir:
            self._dir = Path(registry_dir)
        else:
            # Locate relative to backend root
            backend_root = Path(__file__).resolve().parent.parent.parent
            self._dir = backend_root / "templates" / "registry"

    @property
    def registry_path(self) -> Path:
        return self._dir

    def list_templates(self) -> List[Dict[str, Any]]:
        """
        List all available curriculum templates in the registry.
        """
        if not self._dir.exists():
            logger.warning("Template registry directory does not exist: %s", self._dir)
            return []

        templates = []
        for file_path in sorted(self._dir.glob("*.json")):
            try:
                with open(file_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    topics = data.get("topics", [])
                    total_min = sum(t.get("estimated_minutes", 45) for t in topics)
                    templates.append({
                        "id": data.get("id", file_path.stem),
                        "title": data.get("title", file_path.stem.title()),
                        "category": data.get("category", "Backend / DevOps"),
                        "description": data.get("description", ""),
                        "topic_count": len(topics),
                        "total_estimated_minutes": total_min,
                        "interface_language": data.get("interface_language", "en"),
                        "learning_language": data.get("learning_language", "en"),
                        "source_language": data.get("source_language", "en"),
                    })
            except Exception as err:
                logger.error("Failed to parse template file %s: %s", file_path, err)

        return templates

    def get_template(self, template_id: str) -> Optional[Dict[str, Any]]:
        """
        Load a specific template by identifier (e.g., 'backend-devops' or 'python').
        """
        clean_id = template_id.replace(".json", "")
        file_path = self._dir / f"{clean_id}.json"

        if not file_path.exists():
            return None

        try:
            with open(file_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as err:
            logger.error("Error reading template %s: %s", file_path, err)
            return None


template_service = TemplateService()
