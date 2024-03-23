import { Check, Loader2, X } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import * as Dialog from '@radix-ui/react-dialog'

import { Button } from './ui/button'
import { useMutation, useQueryClient } from '@tanstack/react-query'

const createTagSchema = z.object({
  title: z.string().min(3),
})

type CreateTagSchema = z.infer<typeof createTagSchema>

function getSlugFromString(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, '-');
}

export function CreateTagForm() {
  const queryClient = useQueryClient()

  const { register, handleSubmit, watch, formState } = useForm<CreateTagSchema>({
    resolver: zodResolver(createTagSchema)
  })

  const slug = watch('title')
    ? getSlugFromString(watch('title'))
    : ''


  const { mutateAsync } = useMutation({
    mutationFn: async ({ title }: CreateTagSchema) => {
      await new Promise(resolve => setTimeout(resolve, 3000))

      await fetch('http://localhost:3333/tags', {
        method: 'POST',
        body: JSON.stringify({ title, slug, amountOfVideos: 0 })
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['get-tags']
      })
    }
  })

  async function createTag({ title }: CreateTagSchema) {
    await mutateAsync({ title })
  }

  return (
    <form className='w-full space-y-6' onSubmit={handleSubmit(createTag)}>
      <div className='space-y-2'>
        <label htmlFor="title" className='text-sm font-medium block'>Tag name</label>
        <input
          className='border border-zinc-800 rounded-l px-3 py-2.5 bg-zinc-800/50 w-full text-sm'
          type="text"
          id="title"
          {...register('title')}
        />
        {formState.errors?.title && (
          <p className='text-sm text-red-400'>{formState.errors.title.message}</p>
        )}
      </div>

      <div className='space-y-2'>
        <label htmlFor="slug" className='text-sm font-medium block'>Slug</label>
        <input
          className='border border-zinc-800 rounded-l px-3 py-2.5 bg-zinc-800/50 w-full text-sm'
          type="text"
          readOnly
          id="slug"
          value={slug}
        />
      </div>

      <div className='flex items-center justify-end gap-2'>
        <Dialog.Close asChild>
          <Button>
            <X className='size-3' /> Cancel
          </Button>
        </Dialog.Close>

        <Button className='bg-teal-400 text-teal-950' type="submit" disabled={formState.isSubmitting}>
          {formState.isSubmitting ? <Loader2 className='size-3 animate-spin' /> : <Check className='size-3' />}
          Save
        </Button>
      </div>
    </form>
  )
}
