import math
from typing import List, Dict, Any, Optional
from collections import deque, defaultdict


class TimeAwareScheduler:
    """
    Time-Aware Study Plan Scheduler (Packet 1I).
    Transforms discrete learning topics into a structured, pedagogical StudyPlan.
    
    Capabilities:
    1. Topological sort respecting DAG prerequisite constraints.
    2. Deep-work session chunking (30-60 min blocks) with cognitive breaks.
    3. Milestone insertion after prerequisite completions.
    4. Adaptive scheduling based on user available time limits (e.g., 180 min sprint)
       and daily target capacity.
    """

    def topological_sort_topics(self, raw_topics: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Sort topics topologically so prerequisites always come before dependents.
        Falls back to original order if circular dependencies are detected.
        """
        if not raw_topics:
            return []

        title_to_topic = {t["title"].strip().lower(): t for t in raw_topics}
        adj = defaultdict(list)
        in_degree = defaultdict(int)

        # Initialize all topics in in_degree map
        for t in raw_topics:
            key = t["title"].strip().lower()
            if key not in in_degree:
                in_degree[key] = 0

        # Build graph edges: prereq -> topic
        for t in raw_topics:
            topic_key = t["title"].strip().lower()
            deps = t.get("dependencies", []) or []
            for d in deps:
                d_key = d.strip().lower()
                if d_key in title_to_topic and d_key != topic_key:
                    adj[d_key].append(topic_key)
                    in_degree[topic_key] += 1

        # Kahn's algorithm
        queue = deque([k for k, deg in in_degree.items() if deg == 0])
        sorted_keys = []

        while queue:
            curr = queue.popleft()
            sorted_keys.append(curr)
            for neighbor in adj[curr]:
                in_degree[neighbor] -= 1
                if in_degree[neighbor] == 0:
                    queue.append(neighbor)

        # If cyclic or incomplete, append remaining topics
        if len(sorted_keys) < len(raw_topics):
            for t in raw_topics:
                k = t["title"].strip().lower()
                if k not in sorted_keys:
                    sorted_keys.append(k)

        return [title_to_topic[k] for k in sorted_keys if k in title_to_topic]

    def build_study_plan(
        self,
        topics: List[Dict[str, Any]],
        available_time_minutes: Optional[int] = None,
        daily_target_minutes: int = 60,
        default_session_minutes: int = 45,
        default_break_minutes: int = 10
    ) -> Dict[str, Any]:
        """
        Build a complete time-aware study plan structure with sessions, days, and milestones.
        """
        # 1. Ensure topological ordering
        ordered_topics = self.topological_sort_topics(topics)
        
        # 2. Filter or prioritize if user specified an overall time limit (e.g. 180 min sprint)
        sprint_mode = False
        if available_time_minutes and available_time_minutes > 0:
            sprint_mode = True

        sessions: List[Dict[str, Any]] = []
        cumulative_minutes = 0
        current_day = 1
        current_day_minutes = 0
        session_idx = 1

        for i, topic in enumerate(ordered_topics):
            topic_title = topic["title"]
            est_minutes = int(topic.get("estimated_minutes", default_session_minutes) or default_session_minutes)
            difficulty = topic.get("difficulty", "INTERMEDIATE")

            # Break large topics into sub-blocks if > 75 minutes
            if est_minutes > 75:
                part1_min = est_minutes // 2
                part2_min = est_minutes - part1_min
                parts = [
                    (f"{topic_title} (Part 1: Core Concepts)", part1_min),
                    (f"{topic_title} (Part 2: Hands-on Lab)", part2_min),
                ]
            else:
                parts = [(topic_title, est_minutes)]

            for part_title, part_min in parts:
                if sprint_mode and (cumulative_minutes + part_min > (available_time_minutes or 0)):
                    # Time limit reached for this sprint
                    break

                # Day rollover
                if current_day_minutes + part_min > daily_target_minutes and current_day_minutes > 0:
                    current_day += 1
                    current_day_minutes = 0

                break_time = default_break_minutes
                # Extra break time after advanced topics
                if difficulty.upper() == "ADVANCED":
                    break_time = 15

                sessions.append({
                    "session_index": session_idx,
                    "title": part_title,
                    "planned_minutes": part_min,
                    "topics": [topic_title],
                    "break_after_minutes": break_time,
                    "is_milestone": False,
                    "day_number": current_day,
                    "week_number": math.ceil(current_day / 5)
                })

                session_idx += 1
                cumulative_minutes += part_min
                current_day_minutes += part_min

            # Add milestone review checkpoint after every 3 topics
            if (i + 1) % 3 == 0 and not (sprint_mode and cumulative_minutes >= (available_time_minutes or 0)):
                milestone_min = 25
                sessions.append({
                    "session_index": session_idx,
                    "title": f"Milestone Review & Integration Lab #{((i + 1) // 3)}",
                    "planned_minutes": milestone_min,
                    "topics": [t["title"] for t in ordered_topics[max(0, i-2):i+1]],
                    "break_after_minutes": 15,
                    "is_milestone": True,
                    "day_number": current_day,
                    "week_number": math.ceil(current_day / 5)
                })
                session_idx += 1
                cumulative_minutes += milestone_min
                current_day_minutes += milestone_min

        total_study_minutes = sum(s["planned_minutes"] for s in sessions if not s["is_milestone"])
        total_milestone_minutes = sum(s["planned_minutes"] for s in sessions if s["is_milestone"])
        total_planned_minutes = total_study_minutes + total_milestone_minutes
        total_breaks = sum(s["break_after_minutes"] for s in sessions)
        estimated_days = max(1, current_day)
        estimated_weeks = math.ceil(estimated_days / 5)

        return {
            "total_planned_minutes": total_planned_minutes,
            "total_study_minutes": total_study_minutes,
            "total_break_minutes": total_breaks,
            "daily_target_minutes": daily_target_minutes,
            "estimated_days": estimated_days,
            "estimated_weeks": estimated_weeks,
            "total_sessions": len(sessions),
            "sprint_mode": sprint_mode,
            "available_time_limit_minutes": available_time_minutes,
            "sessions": sessions
        }


scheduler = TimeAwareScheduler()
