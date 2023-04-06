import { Field, FieldProps, setIn } from "formik";
import React, { useCallback } from "react";

import { FormikConnectionFormValues } from "components/connection/ConnectionForm/formConfig";

import { SyncSchemaStream } from "core/domain/catalog";
import { AirbyteStreamConfiguration } from "core/request/AirbyteClient";
import { useConnectionFormService } from "hooks/services/ConnectionForm/ConnectionFormService";

import styles from "./SyncCatalogBody.module.scss";
import { SyncCatalogRow } from "./SyncCatalogRow";
import { StreamsConfigTableConnectorHeader } from "../StreamsConfigTable/StreamsConfigTableConnectorHeader";
import { StreamsConfigTableHeader } from "../StreamsConfigTable/StreamsConfigTableHeader";

interface SyncCatalogBodyProps {
  streams: SyncSchemaStream[];
  changedStreams: SyncSchemaStream[];
  onStreamChanged: (stream: SyncSchemaStream) => void;
}

export const SyncCatalogBody: React.FC<SyncCatalogBodyProps> = ({ streams, changedStreams, onStreamChanged }) => {
  const { mode } = useConnectionFormService();

  const onUpdateStream = useCallback(
    (id: string | undefined, newConfig: Partial<AirbyteStreamConfiguration>) => {
      const streamNode = streams.find((streamNode) => streamNode.id === id);

      if (streamNode) {
        const newStreamNode = setIn(streamNode, "config", { ...streamNode.config, ...newConfig });

        // config.selectedFields must be removed if fieldSelection is disabled
        if (!newStreamNode.config.fieldSelectionEnabled) {
          delete newStreamNode.config.selectedFields;
        }

        onStreamChanged(newStreamNode);
      }
    },
    [streams, onStreamChanged]
  );

  return (
    <div data-testid="catalog-tree-table-body">
      <div className={styles.header}>
        <StreamsConfigTableConnectorHeader />
        <StreamsConfigTableHeader />
      </div>
      {streams.map((streamNode) => (
        <Field key={`schema.streams[${streamNode.id}].config`} name={`schema.streams[${streamNode.id}].config`}>
          {({ form }: FieldProps<FormikConnectionFormValues>) => (
            <SyncCatalogRow
              key={`schema.streams[${streamNode.id}].config`}
              errors={form.errors}
              namespaceDefinition={form.values.namespaceDefinition}
              namespaceFormat={form.values.namespaceFormat}
              prefix={form.values.prefix}
              streamNode={streamNode}
              updateStream={onUpdateStream}
              changedSelected={changedStreams.includes(streamNode) && mode === "edit"}
            />
          )}
        </Field>
      ))}
    </div>
  );
};