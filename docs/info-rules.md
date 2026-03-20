// SLM::info-rules (Authoritative Agent Spec)
// Priority_Order == docs/info-rules.md > docs/infos/info-*.md > code_comments

[1_Global_Context]
Target_Files == docs/infos/info-*.md
Goal == keep design-intent docs machine-readable + compact + conflict-resistant
Conflict_Priority == docs/info-rules.md > docs/infos/info-*.md > code_comments > narrative_preference
Intent_Priority == documented_intent > current_code_behavior

[2_Operator_Semantics]
Format == pseudo-code declarative lines
Atomic_Rule == 1_line == 1_atomic_rule
`::` => scoped label / grouped rule block
`==` => exact requirement / fixed value
`=>` => required implication / invariant assertion
`->` => ordered sequence / workflow only
`!`  => forbidden content / forbidden pattern
`!=` => must differ / must not equal

[3_Language_Policy]
Capsule_Language == English
!Mixed_Language_Prose
Condition(Non_English_Term_Needed) => append_canonical_English_inline_once
Style == short technical wording | no narrative filler

[4_Content_Scope]
Requires :: Intent | Invariants | Perf/Scale assumptions | Change checklist
!Forbidden_Content :: Install_steps | Run_commands | Tutorials | API_catalogs | Long_code_examples | Narratives
Data_Rule :: Constant_tables | Enum_tables | Value_tables => move_to_code_comments
Boundary_Rule == explain_why_and_constraints | do_not_explain_how_to_use

[5_Naming_And_Placement]
Primary_Path == docs/infos/
File_Format == info-{context}.md
Context_Rules == short + lowercase + hyphenated
Rule == 1_context == 1_file
Exception_Log == docs/infos/info-decisions.md
Condition(Ownership_Unclear) => write_parent_boundary_capsule_first
Condition(Too_Granular) => merge_into_parent_context
!Placement :: skeleton_dump | every_directory

[6_Strict_Template_And_Budget]
Required_Headers == EXACTLY:
  `# @Intent`
  `# @Invariants`
  `# @Perf_Scale`
  `# @Checklist`
Header_Order == fixed
Target_Line_Budget == 24..48
Hard_Line_Max == 60
Condition(Context_Is_Small) => allow_shorter_file_without_padding
Section_Line_Budget ::
  `@Intent` => 2..5
  `@Invariants` => 4..10
  `@Perf_Scale` => 1..6
  `@Checklist` => 4..10
Condition(Perf_Scale_Not_Applicable) => write `- None`

[7_Formatting_Rules]
Section_Body == single-level bullets only
Bullet_Form == `- Subject => constraint / behavior / decision`
!Paragraph_Blocks
!Nested_Bullets
!Storytelling_Tone
!Mixed_Style_In_One_File
Write_Style == operator-led assertions
Compression_Rule => minimize_tokens_without_losing_operational_meaning

[8_Agent_Execution_Protocol]
Pre_Task -> Read docs/info-rules.md -> Read relevant docs/infos/info-*.md
Condition(Ambiguity_or_Conflict) -> Edit_capsule_doc_FIRST -> Align_code_to_doc -> Re_validate
Condition(Non_Compliant_Capsule_Edited) => normalize_entire_file_to_spec
!Partial_Fixes :: do_not_leave_mixed_style_in_single_file

[9_Environment_Constraints]
Env == Meteor_v3_Server
Mongo_API == async_only
!Sync_Mongo_API :: `findOne` | `insert` | `update` | `remove`
Allowed_Mongo_API == `findOneAsync` | `insertAsync` | `updateAsync` | `removeAsync` | `fetchAsync` | `countAsync`
Data_Access_Capsule_Rule => preserve_async_only_invariant

[10_Review_Gate]
Pass_Condition :: exact_headers | fixed_header_order | atomic_bullets_only | no_tutorial_content | explicit_scope_boundary | no_mixed_style
Interpret_Priority == strict_SLM_format > natural_prose
Failure_Action == normalize_to_spec_before_merge
