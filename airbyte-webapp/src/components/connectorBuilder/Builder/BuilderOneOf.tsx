import { FastField, FastFieldProps } from "formik";
import React from "react";

import GroupControls from "components/GroupControls";
import { ControlLabels } from "components/LabeledControl";
import { DropDown } from "components/ui/DropDown";

import { getLabelAndTooltip } from "./manifestHelpers";

interface Option {
  label: string;
  value: string;
  default?: object;
}

export interface OneOfOption {
  label: string; // label shown in the dropdown menu
  typeValue: string; // value to set on the `type` field for this component - should match the oneOf type definition
  default?: object; // default values for the path
  children?: React.ReactNode;
}

interface BuilderOneOfProps {
  options: OneOfOption[];
  path: string; // path to the oneOf component in the json schema
  label?: string;
  tooltip?: string;
  manifestPath?: string;
  manifestOptionPaths?: string[];
  onSelect?: (type: string) => void;
}

const InnerBuilderOneOf: React.FC<BuilderOneOfProps & FastFieldProps<{ type: string }>> = ({
  options,
  label,
  tooltip,
  field: typePathField,
  path,
  form,
  manifestPath,
  manifestOptionPaths,
  onSelect,
}) => {
  const value = typePathField.value.type;

  const selectedOption = options.find((option) => option.typeValue === value);
  const { label: finalLabel, tooltip: finalTooltip } = getLabelAndTooltip(
    label,
    tooltip,
    manifestPath,
    path,
    false,
    manifestOptionPaths
  );

  return (
    <GroupControls
      label={<ControlLabels label={finalLabel} infoTooltipContent={finalTooltip} />}
      control={
        <DropDown
          {...typePathField}
          options={options.map((option) => {
            return { label: option.label, value: option.typeValue, default: option.default };
          })}
          value={value ?? options[0].typeValue}
          onChange={(selectedOption: Option) => {
            if (selectedOption.value === value) {
              return;
            }
            // clear all values for this oneOf and set selected option and default values
            form.setFieldValue(path, {
              type: selectedOption.value,
              ...selectedOption.default,
            });

            onSelect?.(selectedOption.value);
          }}
        />
      }
    >
      {selectedOption?.children}
    </GroupControls>
  );
};
export const BuilderOneOf: React.FC<BuilderOneOfProps> = (props) => {
  return (
    <FastField name={props.path}>
      {(fastFieldProps: FastFieldProps<{ type: string }>) => <InnerBuilderOneOf {...props} {...fastFieldProps} />}
    </FastField>
  );
};
