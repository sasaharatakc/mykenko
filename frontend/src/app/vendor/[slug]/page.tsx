import { redirect } from 'next/navigation'

interface Props {
  params: { slug: string }
}

export default function VendorSlugPage({ params }: Props) {
  redirect(`/stores/${params.slug}`)
}
