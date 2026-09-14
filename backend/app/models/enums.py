import enum

class GenerationType(str, enum.Enum):
    USER_CREATED = "USER_CREATED"
    SOURCE_EXTRACTED = "SOURCE_EXTRACTED"
    AI_INFERRED = "AI_INFERRED"
    MIXED = "MIXED"
