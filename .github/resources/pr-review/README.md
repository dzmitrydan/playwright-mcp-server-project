# pr-review private resources

Keep provider-specific review guidance and private reference material here.
Do not place secrets in this directory. The public workflow is defined by the
`pr-review` agent and skill.

The reusable HTML review layout is `review-report.template.html`. Replace its
`{{...}}` placeholders when rendering a report; each finding should include an
expanded details block and an adjacent relevant-code panel.
