import { redirect } from 'next/navigation'

interface Props {
  params: Promise<{ id: string }>
}

export default async function AdminProductPage({ params }: Props) {
  const { id } = await params
  redirect(`/admin/products/${id}/edit`)
}
