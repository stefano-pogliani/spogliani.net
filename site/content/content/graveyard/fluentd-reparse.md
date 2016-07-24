+++
date = "2016-07-11T23:04:18+01:00"
title = "FluentD Reparse"
description = "Use FluentD's in_tail parser as a filter plugin."

active_menu = "content.graveyard"
type = "project"
+++


I was using [FluentD](http://www.fluentd.org/) to process a log file from an
application that provided different amounts of information based of the log line
itself and I wanted extract the different structures from the different lines.

While it would be possible to write a series of alternative regular expressions
to recognise and extract information from the different lines it did not
look practical or extendable.
Moreover I prefer an approach that uses tags to route logs through multiple
filters, each doing a different bit.


Usage
-----
For these reasons I developed a very small plugin that uses the default FluentD
parser but on existing records instead of raw inputs. The code is available in
a GitHub repository and the plugin is quite limited as it relies on the power
of the parser rather than trying to add more:
```
<match **>
  type reparse
  key  message

  # Any of in_tail formats is supported, including multiline.
  # All named matched are used to extend the current event
  # overwriting any pre-existing keys.
  format /(?<level>DEBUG|INFO|WARN|ERROR): (?<message>.*)/
</match>
```

The above configuration will match all events and try to extract a log level
 from the beginning of the message attribute. The level attribute is added and
 the message one is updated to exclude what was parsed out.
 So the record
```json
{
  "time": 0,
  "message": "INFO: something happened"
}
```

would produce the record
```json
{
  "time": 0,
  "level": "INFO",
  "message": "something happened"
}
```


Installing
----------
Currently two options are available to install the plugin:

  1. Compile the plugin gem locally and install it:

    ```bash
    git clone git@github.com:stefano-pogliani/fluent-plugin-reparse.git
    cd fluent-plugin-reparse
    gem build fluent-plugin-reparse.gemspec
    gem install fluent-plugin-reparse
    ```

  2. Manually copy the plugin file into your FluentD installation as explained in their documentation .
