def get_curriculum_prompt(effective_input: str, effective_title: str) -> str:
    return (
        "You are a Principal Curriculum Architect and Staff Systems Engineer. "
        f"{effective_input}\n\n"
        "CRITICAL RULE: Heavily prioritize user-uploaded sources (PDF/TXT transcripts) over general knowledge. "
        "If a specific source text is provided, ensure the curriculum precisely reflects its structure, chapters, and terminology.\n\n"
        "Analyze and synthesize an exhaustive, production-grade learning roadmap with strict DAG prerequisites, "
        "actionable hands-on competency tasks, and verified documentation references.\n\n"
        "You MUST return a JSON object with this exact structure:\n"
        "{\n"
        f'  "title": "{effective_title}",\n'
        '  "category": "Technology & Engineering",\n'
        '  "summary": "Concise executive overview of the roadmap",\n'
        '  "topics": [\n'
        '    {\n'
        '      "title": "Topic Name",\n'
        '      "description": "Topic explanation",\n'
        '      "subtopics": ["Subtopic 1", "Subtopic 2"],\n'
        '      "prerequisites": ["Dependent Topic Name (if any)"],\n'
        '      "dependencies": [],\n'
        '      "estimated_minutes": 60,\n'
        '      "difficulty": "beginner|intermediate|advanced"\n'
        '    }\n'
        '  ]\n'
        "}\n"
    )
