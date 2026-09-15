def get_quiz_prompt(subtopic_name: str) -> str:
    return (
        f"Generate a rigorous conceptual verification quiz question to verify genuine engineering understanding "
        f"for the subtopic: '{subtopic_name}'.\n"
        "CRITICAL RULE: Heavily prioritize extracting core concepts from the provided user context/source if present. "
        "Do NOT ask trivial syntax questions. Test deep architectural reasoning, failure modes, or edge cases.\n"
        "Return a strictly valid JSON object with the following schema:\n"
        "{\n"
        '  "question": "The question text",\n'
        '  "options": ["Option A", "Option B", "Option C", "Option D"],\n'
        '  "correct_answer_index": 0,\n'
        '  "explanation": "Why this answer is correct and why the alternatives are incorrect"\n'
        "}\n"
    )
