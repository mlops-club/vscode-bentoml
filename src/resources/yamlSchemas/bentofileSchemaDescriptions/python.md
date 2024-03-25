`python` (optional)

Configure how and which Python packages to be installed in the bento.

You specify the required Python packages for a given Bento using the `python.packages` field. 

BentoML allows you to specify the
desired version and install a package from a custom PyPI source or from a GitHub repository. 

If a package lacks a specific version,
BentoML will lock the package to the version available in the current environment when building a Bento.

```yaml
python:
  packages:
    - "numpy"
    - "matplotlib==3.5.1"
    - "package>=0.2,<0.3"
    - "torchvision==0.9.2 --extra-index-url https://download.pytorch.org/whl/lts/1.8/cpu"
    - "git+https://github.com/username/mylib.git@main"
```

**Note:** You don't need to specify `bentoml` as a dependency in this field since the current version of BentoML will be added to the list by default. 

However,
you can override this by specifying a different BentoML version.

If you already have a [requirements.txt](https://pip.pypa.io/en/stable/reference/requirements-file-format/) file that defines Python packages for your project, you may also supply a path to the `requirements.txt` file directly:

```yaml
python:
  requirements_txt: "./demos/xgboost/service/requirements.txt"
```

## Pip install options

You can provide additional `pip install` arguments in the `python` field. 

If provided, these arguments will be applied to all packages defined in `python.packages` as
well as the `requirements_txt` file.

```yaml
python:
  requirements_txt: "./requirements.txt"
  index_url: "https://my.old.mirror/simple"
  no_index: False
  trusted_host:
    - "pypi.python.org"
    - "my.old.mirror"
  find_links:
    - "https://download.pytorch.org/whl/cu80/stable.html"
  extra_index_url:
    - "https://<other_api_token>:@my.new.mirror/pypi/simple"
    - "https://pypi.python.org/simple"
  pip_args: "--pre -U --force-reinstall"
```

**Note:**

**By default, BentoML caches pip artifacts across all local image builds to speed up the build process**.

If you want to force a re-download instead of using the cache, you can specify the `pip_args: "--no-cache-dir"` option in your
`bentofile.yaml` file, or use the `--no-cache` option in the `bentoml containerize` command. 

For example:

```bash
bentoml containerize my_bento:latest --no-cache
```