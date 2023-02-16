import * as React from "react";

// import { JSONEditor } from "@json-editor/json-editor";
// https://github.com/json-editor/json-editor/wiki
//https://github.com/rjsf-team/react-jsonschema-form
// import validator from "@rjsf/validator-ajv8";
// import Form from "@rjsf/core";
import validator from "@rjsf/validator-ajv8";
import Form from "@rjsf/core";
import { RJSFSchema } from "@rjsf/utils";

export class TabConfigApps extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {}
  render() {
    const log = (type) => console.log.bind(console, type);
    const schema = {};
    return (
      <div>
        {JSON.stringify(this.props)}{" "}
        <Form
          schema={schema}
          validator={validator}
          onChange={log("changed")}
          onSubmit={log("submitted")}
          onError={log("errors")}
        />
      </div>
    );
  }
}
