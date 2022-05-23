

import yaml


class YAMLError(Exception):
    pass


def load_yaml_file(file_or_filename):
    """
    Load yaml from file object or filename.
    """
    if isinstance(file_or_filename, str):
        with open(file_or_filename, 'rb') as f:
            return load_yaml(f)
    return load_yaml(file_or_filename)


def load_yaml(doc):
    """
    Load yaml from file object or string.
    """
    try:
        if getattr(yaml, '__with_libyaml__', False):
            try:
                return yaml.load(doc, Loader=yaml.CLoader)
            except AttributeError:
                # handle cases where __with_libyaml__ is True but
                # CLoader doesn't work (missing .dispose())
                return yaml.safe_load(doc)
        return yaml.safe_load(doc)
    except (yaml.scanner.ScannerError, yaml.parser.ParserError) as ex:
        raise YAMLError(str(ex))


if __name__ == '__main__':
    conf_file = 'config.yaml'
    load_yaml_file(conf_file)
