`setup_script` (optional)

For advanced Docker customization, you can also use the `setup_script`
field to inject any script during the image build process.

For example,
with NLP projects you can pre-download NLTK data in the image by setting
the following values.

In the `bentofile.yaml` file:

```yaml
# bentofile.yaml
---
python:
  packages:
    - nltk
docker:
  setup_script: './setup.sh'
```

In the `setup.sh` file:

```bash
#!/bin/bash
set -euxo pipefail

echo "Downloading NLTK data.."
python -m nltk.downloader all
```

Build a new Bento and then run
`bentoml containerize MY_BENTO --progress plain` to view the Docker
image build progress.

The newly built Docker image will contain the
pre-downloaded NLTK dataset.

> **Tip**
> When working with bash scripts, we recommend you add
> `set -euxo pipefail` to the beginning.
> Especially when `set -e` is missing, the script will fail silently without
> raising an exception during `bentoml containerize`. Learn more about
> [Bash Set builtin](https://www.gnu.org/software/bash/manual/html_node/The-Set-Builtin.html).

It is also possible to provide a Python script for initializing the
Docker image.

**Example**

In the `bentofile.yaml` file:

```yaml
# bentofile.yaml
---
python:
  packages:
    - nltk
docker:
  setup_script: './setup.py'
```

In the `setup.py` file:

```python
#!/usr/bin/env python

import nltk

print("Downloading NLTK data..")
nltk.download('treebank')
```

> **Note**
> Pay attention to `#!/bin/bash` and `#!/usr/bin/env python` in the first
> line of the example scripts above.
> They are known as
> [Shebang](<https://en.wikipedia.org/wiki/Shebang_(Unix)>) and they are
> required in a setup script provided to BentoML.

Setup scripts are always executed after the specified Python packages,
conda dependencies, and system packages are installed. Therefore, you
can import and utilize those libraries in your setup script for the
initialization process.

[Documentation](https://docs.bentoml.org/en/latest/guides/build-options.html#setup-script)
