`description` (optional) allows you to annotate your Bento with relevant documentation, which can be written in plain text or [Markdown](https://daringfireball.net/projects/markdown/syntax) format.

The description appears in the Bento's OpenAPI UI and supports full markdown.

You can either directly provide the description in `bentofile.yaml` or reference an external file through a path.

#### (Option 1) Inline

```yaml
service: 'service:svc'
description: |
  ## Description For My Bento 🍱

  Use **any markdown syntax** here!

  > BentoML is awesome!
include: ...
```

#### (Option 2) File path

```yaml
service: 'service:svc'
description: 'file: ./README.md'
include: ...
```

For descriptions sourced from an external file, you can use either an absolute or relative path.

Make sure the file exists at the specified path when the `bentoml build` command is run.

For relative paths, the reference point is the `build_ctx`, which defaults to the directory from which `bentoml build` is executed.

[Documentation](https://docs.bentoml.org/en/latest/guides/build-options.html#description)
