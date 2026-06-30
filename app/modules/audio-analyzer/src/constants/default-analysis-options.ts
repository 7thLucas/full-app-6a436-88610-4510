import type { TranscriptionAnalysisOptions } from "../libs/types";

/**
 * Default analysis options for autoMoM meeting recordings.
 * Configured for business meeting context — extracts action items, decisions, and summaries.
 */
export const defaultAnalysisOptions: TranscriptionAnalysisOptions = {
  context:
    "Business meeting between team members. Identify action items, decisions made, key discussion points, and follow-up tasks. Evaluate clarity of communication and meeting effectiveness.",
  speaker_roles: ["facilitator", "participant", "stakeholder"],
  primary_role: "facilitator",
  default_role: "participant",
  role_display: {
    facilitator: "Facilitator",
    participant: "Participant",
    stakeholder: "Stakeholder",
  },
  scoring_rules: [
    {
      id: "action_item_clarity",
      title: "Action Item Clarity",
      rule: "Score 0-{max_score} for how clearly action items were assigned with owners and deadlines.",
      params: { max_score: "100" },
    },
    {
      id: "decision_documentation",
      title: "Decision Documentation",
      rule: "Score 0-{max_score} for how well decisions were stated, rationale provided, and recorded.",
      params: { max_score: "100" },
    },
    {
      id: "meeting_focus",
      title: "Meeting Focus",
      rule: "Score 0-{max_score} for how well the meeting stayed on agenda and used time effectively.",
      params: { max_score: "100" },
    },
    {
      id: "participation_balance",
      title: "Participation Balance",
      rule: "Score 0-{max_score} for balanced contributions from all relevant participants.",
      params: { max_score: "100" },
    },
  ],
};
