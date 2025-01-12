import { useField } from "formik";
import { useIntl } from "react-intl";

import { ControlLabels } from "components/LabeledControl";

import { RequestOption } from "core/request/ConnectorManifest";
import { links } from "utils/links";

import { BuilderCard } from "./BuilderCard";
import { BuilderField } from "./BuilderField";
import { BuilderFieldWithInputs } from "./BuilderFieldWithInputs";
import { BuilderList } from "./BuilderList";
import { BuilderOneOf, OneOfOption } from "./BuilderOneOf";
import { RequestOptionFields } from "./RequestOptionFields";
import { StreamReferenceField } from "./StreamReferenceField";
import { ToggleGroupField } from "./ToggleGroupField";
import { BuilderStream, LIST_PARTITION_ROUTER, SUBSTREAM_PARTITION_ROUTER } from "../types";

interface PartitionSectionProps {
  streamFieldPath: (fieldPath: string) => string;
  currentStreamIndex: number;
}

export const PartitionSection: React.FC<PartitionSectionProps> = ({ streamFieldPath, currentStreamIndex }) => {
  const { formatMessage } = useIntl();
  const [field, , helpers] = useField<BuilderStream["partitionRouter"]>(streamFieldPath("partitionRouter"));

  const handleToggle = (newToggleValue: boolean) => {
    if (newToggleValue) {
      helpers.setValue([
        {
          type: LIST_PARTITION_ROUTER,
          values: { type: "list", value: [] },
          cursor_field: "",
        },
      ]);
    } else {
      helpers.setValue(undefined);
    }
  };
  const toggledOn = field.value !== undefined;

  const getSlicingOptions = (buildPath: (path: string) => string): OneOfOption[] => [
    {
      label: "List",
      typeValue: LIST_PARTITION_ROUTER,
      default: {
        values: { type: "list", value: [] },
        cursor_field: "",
      },
      children: (
        <>
          <BuilderOneOf
            path={buildPath("values")}
            manifestPath="ListPartitionRouter.properties.values"
            options={[
              {
                label: "Value List",
                typeValue: "list",
                default: { value: [] },
                children: <BuilderField type="array" path={buildPath("values.value")} label="Value list" />,
              },
              {
                label: "User Input",
                typeValue: "variable",
                default: { value: "" },
                children: (
                  <BuilderFieldWithInputs
                    type="string"
                    path={buildPath("values.value")}
                    label="Value"
                    tooltip="Reference an array user input here to allow the user to specify the values to iterate over: {{ config['user_input_name'] }}"
                    pattern={"{{ config['user_input_name'] }}"}
                  />
                ),
              },
            ]}
          />
          <BuilderFieldWithInputs
            type="string"
            path={buildPath("cursor_field")}
            manifestPath="ListPartitionRouter.properties.cursor_field"
          />
          <ToggleGroupField<RequestOption>
            label="Inject partition value into outgoing HTTP request"
            tooltip="Optionally configures how the partition value will be sent in requests to the source API"
            fieldPath={buildPath("request_option")}
            initialValues={{
              inject_into: "request_parameter",
              type: "RequestOption",
              field_name: "",
            }}
          >
            <RequestOptionFields path={buildPath("request_option")} descriptor="slice value" excludePathInjection />
          </ToggleGroupField>
        </>
      ),
    },
    {
      label: "Substream",
      typeValue: SUBSTREAM_PARTITION_ROUTER,
      default: {
        parent_key: "",
        partition_field: "",
        parentStreamReference: "",
      },
      children: (
        <>
          <StreamReferenceField
            currentStreamIndex={currentStreamIndex}
            path={buildPath("parentStreamReference")}
            label="Parent stream"
            tooltip="The stream to read records from. Make sure there are no cyclic dependencies between streams"
          />
          <BuilderFieldWithInputs
            type="string"
            path={buildPath("parent_key")}
            manifestPath="ParentStreamConfig.properties.parent_key"
          />
          <BuilderFieldWithInputs
            type="string"
            path={buildPath("partition_field")}
            manifestPath="ParentStreamConfig.properties.partition_field"
          />
        </>
      ),
    },
  ];

  return (
    <BuilderCard
      docLink={links.connectorBuilderPartitioning}
      label={
        <ControlLabels
          label="Partitioning"
          infoTooltipContent="Configure how to partition a stream into subsets of records and iterate over the data. If multiple partition routers are defined, the cartesian product of the slices from all routers is formed."
        />
      }
      toggleConfig={{
        toggledOn,
        onToggle: handleToggle,
      }}
      copyConfig={{
        path: "partitionRouter",
        currentStreamIndex,
        copyFromLabel: formatMessage({ id: "connectorBuilder.copyFromPartitionRouterTitle" }),
        copyToLabel: formatMessage({ id: "connectorBuilder.copyToPartitionRouterTitle" }),
      }}
    >
      <BuilderList
        addButtonLabel={formatMessage({ id: "connectorBuilder.addNewPartitionRouter" })}
        basePath={streamFieldPath("partitionRouter")}
        emptyItem={{
          type: LIST_PARTITION_ROUTER,
          values: [],
          cursor_field: "",
        }}
      >
        {({ buildPath }) => (
          <BuilderOneOf
            path={buildPath("")}
            label="Partition router"
            manifestOptionPaths={["ListPartitionRouter", "ParentStreamConfig"]}
            tooltip="Method to use on this router"
            options={getSlicingOptions(buildPath)}
          />
        )}
      </BuilderList>
    </BuilderCard>
  );
};
