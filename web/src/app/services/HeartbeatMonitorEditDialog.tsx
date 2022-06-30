import React, { useState } from 'react'
import { useQuery, useMutation, gql } from 'urql'
import { fieldErrors, nonFieldErrors } from '../util/errutil'
import FormDialog from '../dialogs/FormDialog'
import HeartbeatMonitorForm, { Value } from './HeartbeatMonitorForm'
import Spinner from '../loading/components/Spinner'
import { GenericError } from '../error-pages'

const mutation = gql`
  mutation ($input: UpdateHeartbeatMonitorInput!) {
    updateHeartbeatMonitor(input: $input)
  }
`
const query = gql`
  query ($id: ID!) {
    heartbeatMonitor(id: $id) {
      id
      name
      timeoutMinutes
    }
  }
`

export default function HeartbeatMonitorEditDialog(props: {
  monitorID: string
  onClose: () => void
}): JSX.Element {
  const [value, setValue] = useState<Value | null>(null)

  const [{ data, error, fetching }] = useQuery({
    query,
    variables: { id: props.monitorID },
  })
  const [updateStatus, update] = useMutation(mutation)

  if (fetching && !data) return <Spinner />
  if (error) return <GenericError error={error.message} />

  return (
    <FormDialog
      maxWidth='sm'
      title='Edit Heartbeat Monitor'
      loading={updateStatus.fetching}
      errors={nonFieldErrors(error)}
      onClose={props.onClose}
      onSubmit={() =>
        update(
          { input: { id: props.monitorID, ...value } },
          { additionalTypenames: ['HeartbeatMonitor'] },
        ).then(props.onClose)
      }
      form={
        <HeartbeatMonitorForm
          errors={fieldErrors(error).map((f) => ({
            ...f,
            field: f.field === 'timeout' ? 'timeoutMinutes' : f.field,
          }))}
          disabled={updateStatus.fetching}
          value={
            value || {
              name: data.heartbeatMonitor.name,
              timeoutMinutes: data.heartbeatMonitor.timeoutMinutes,
            }
          }
          onChange={(value) => setValue(value)}
        />
      }
    />
  )
}
