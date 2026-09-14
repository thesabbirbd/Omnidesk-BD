/**
 * Omnidesk BD: Master AI Prompt Template & Generator
 * 
 * Provides an exhaustive prompt specification designed to be copied into
 * external AI tools (ChatGPT, Claude, Gemini, DeepSeek) or used natively.
 * The output format is 100% compliant with Omnidesk BD's Universal Ingestion Engine.
 */

export const DEFAULT_TOPIC_PLACEHOLDER = "put your learning topic name here";

export const generateMasterPrompt = (topicInput = '') => {
  const effectiveTopic = (topicInput && topicInput.trim()) 
    ? topicInput.trim() 
    : DEFAULT_TOPIC_PLACEHOLDER;

  return `You are a Principal Curriculum Architect, Staff Software Engineer, and Technical Pedagogy Expert.

Your mission is to construct an exhaustive, production-grade, highly structured learning roadmap and curriculum specification for Omnidesk BD (a Universal Engineering Study Operating System).

The curriculum MUST be delivered in clean, parseable Markdown (.md or .txt) format so that Omnidesk BD's Universal Ingestion Engine can parse, visualize, and persist it into a knowledge graph.

### Architectural & Content Requirements:
1. CURRICULUM ARCHITECTURE:
   - Divide the entire discipline into 6 to 12 sequential, progressive phases/topics (from foundational mental models to advanced production systems, scaling, and observability).
   - For every topic, provide an explicit title, clear conceptual description, estimated study minutes (between 45 and 180 min), and difficulty level: BEGINNER, INTERMEDIATE, or ADVANCED.

2. SUBTOPICS & COMPETENCY VERIFICATION TASKS (ANTI-FAKE-PROGRESS):
   - For each topic, list 3 to 6 granular subtopics.
   - For each subtopic, provide hands-on competency checkpoints/tasks that the learner must physically build, configure, or debug (e.g., "Build a working prototype with async connection pooling", "Configure Prometheus metrics export", "Write an integration test suite").

3. DIRECTED ACYCLIC GRAPH (DAG) PREREQUISITE DEPENDENCIES:
   - Explicitly define the prerequisites for each topic using exact topic titles so Omnidesk BD's React Flow MindMap can draw dependency edges.
   - Format: Dependencies: [Topic A, Topic B] (or Dependencies: [] for root topics).

4. CURATED HIGH-YIELD ONLINE RESOURCES & DOCS:
   - For every topic, provide 2 to 4 real-world online resources:
     * Official documentation links & RFC standards
     * Interactive coding sandboxes or terminal labs (e.g., Killercoda, CodeSandbox, Docker Playground)
     * High-quality video deep dives & architecture diagrams
     * Open-source production GitHub repositories

5. OUTPUT FORMAT SPECIFICATION:
Please follow this exact clean Markdown layout:

# StudySpace: <Title of the Roadmap>
Category: <Engineering Discipline, e.g., Backend & DevOps, Cloud Infrastructure, AI Systems>
Summary: <A 2-3 sentence executive summary of this learning track>

## Topic: <Topic 1 Title>
- Difficulty: BEGINNER
- Estimated Minutes: 90
- Dependencies: []
- Description: <Comprehensive description of what will be mastered in this module>
- Subtopics & Competency Tasks:
  * [ ] <Subtopic 1>: <Concrete hands-on task to build or verify>
  * [ ] <Subtopic 2>: <Concrete hands-on task to build or verify>
  * [ ] <Subtopic 3>: <Concrete hands-on task to build or verify>
- Online Resources:
  * Official Docs: <URL or documentation reference>
  * Interactive Lab: <URL or sandbox guide>

## Topic: <Topic 2 Title>
- Difficulty: INTERMEDIATE
- Estimated Minutes: 120
- Dependencies: [<Topic 1 Title>]
- Description: <Comprehensive description of what will be mastered>
- Subtopics & Competency Tasks:
  * [ ] <Subtopic 1>: <Concrete hands-on task>
  * [ ] <Subtopic 2>: <Concrete hands-on task>
- Online Resources:
  * Guide: <URL or reference>

(Continue sequentially for all topics until the entire domain is mastered)

--------------------------------------------------------------------------------
My learning topic / goal is: "${effectiveTopic}"
--------------------------------------------------------------------------------`;
};
