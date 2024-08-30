import { getPage, getPages } from "@/source";
import { MDXContent } from "@content-collections/mdx/react";
import defaultMdxComponents from "fumadocs-ui/mdx";
import { DocsBody, DocsPage } from "fumadocs-ui/page";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export default function Page({ params }: { params: { slug?: string[] } }) {
  const page = getPage(params.slug);

  if (!page) {
    notFound();
  }

  return (
    // @ts-expect-error
    <DocsPage toc={page.data.toc} full={page.data.full}>
      <DocsBody>
        <h1>{page.data.title}</h1>
        <MDXContent
          code={page.data.body}
          components={{ ...defaultMdxComponents }}
        />
      </DocsBody>
    </DocsPage>
  );
}

export function generateStaticParams() {
  return getPages().map((page) => ({
    slug: page.slugs,
  }));
}

export function generateMetadata({ params }: { params: { slug?: string[] } }) {
  const page = getPage(params.slug);

  if (!page) {
    notFound();
  }

  return {
    title: page.data.title,
    description: page.data.description,
  } satisfies Metadata;
}
