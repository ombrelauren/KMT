import {useEffect, useRef, useState} from 'react'
import {Button, Flex, Stack} from '@sanity/ui'
import {TrashIcon} from '@sanity/icons/Trash'
import {getPublishedId, useDocumentOperation, useFormValue} from 'sanity'
import type {ArrayOfObjectsInputProps} from 'sanity'

const CONFIRM_WINDOW_MS = 4000

// Wraps an array field's default input with a "Clear <label>" button above
// it — empties the array in two clicks instead of removing each item one
// by one. Built as a custom input component (not the unstable_fieldActions
// API, i.e. the field's own "..." menu) because that API's useAction hook
// doesn't run inside the document's form context — props.documentId came
// back as the literal string "root", so useDocumentOperation silently
// patched a document that doesn't exist. Custom input components render
// inside the real form, where useFormValue(['_id']) gives the actual
// draft/published id.
export function createClearArrayInput(fieldName: string, label: string) {
  return function ClearArrayInput(props: ArrayOfObjectsInputProps) {
    const documentId = useFormValue(['_id']) as string | undefined
    const documentType = useFormValue(['_type']) as string | undefined
    const {patch} = useDocumentOperation(
      documentId ? getPublishedId(documentId) : '',
      documentType ?? 'project',
    )
    const [armed, setArmed] = useState(false)
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

    useEffect(() => () => clearTimeout(timeoutRef.current), [])

    const hasItems = Array.isArray(props.value) && props.value.length > 0

    const handleClick = () => {
      if (!armed) {
        setArmed(true)
        timeoutRef.current = setTimeout(() => setArmed(false), CONFIRM_WINDOW_MS)
        return
      }
      clearTimeout(timeoutRef.current)
      setArmed(false)
      patch.execute([{unset: [fieldName]}])
    }

    return (
      <Stack gap={2}>
        {hasItems && (
          <Flex justify="flex-end">
            <Button
              icon={TrashIcon}
              text={armed ? 'Click again to confirm' : label}
              tone={armed ? 'critical' : 'caution'}
              mode="ghost"
              fontSize={1}
              padding={2}
              onClick={handleClick}
            />
          </Flex>
        )}
        {props.renderDefault(props)}
      </Stack>
    )
  }
}
