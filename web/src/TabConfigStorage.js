import * as React from "react";

// import { JSONEditor } from "@json-editor/json-editor";
// https://github.com/json-editor/json-editor/wiki
//https://github.com/rjsf-team/react-jsonschema-form
// import validator from "@rjsf/validator-ajv8";
// import Form from "@rjsf/core";
import validator from "@rjsf/validator-ajv8";
import Form from "@rjsf/core";
// import { RJSFSchema } from "@rjsf/utils";
// import { JsonEditor } from "rc-json-editor";
import JSONInput from "react-json-editor-ajrm";
import locale from "react-json-editor-ajrm/locale/en";

export class TabConfigStorage extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {}
  render() {
    const log = (type) => console.log.bind(console, type);
    const schema = {
      title: "Todo",
      type: "object",
      required: ["title"],
      properties: {
        title: { type: "string", title: "Title", default: "A new task" },
        done: { type: "boolean", title: "Done?", default: false },
      },
      additionalProperties: {
        type: "object",
      },
    };
    return (
      <div>
        {JSON.stringify(this.props)}
        <JSONInput
          placeholder={this.props.config} // data to display
          theme="light_mitsuketa_tribute"
          locale={locale}
          colors={{
            string: "#DAA520", // overrides theme colors with whatever color value you want
          }}
          height="550px"
        />
      </div>
    );
  }
}
