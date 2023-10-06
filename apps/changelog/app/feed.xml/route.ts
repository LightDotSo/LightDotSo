// Copyright (C) 2023 Light, Inc.
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

import assert from "assert";
import * as cheerio from "cheerio";
import { Feed } from "feed";

export async function GET(req: Request) {
  let siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  if (!siteUrl) {
    throw Error("Missing NEXT_PUBLIC_SITE_URL environment variable");
  }

  let author = {
    name: "Joe Davola",
    email: "crazy.joe@example.com",
  };

  let feed = new Feed({
    title: "Commit",
    description: "Open-source Git client for macOS minimalists",
    author,
    id: siteUrl,
    link: siteUrl,
    image: `${siteUrl}/favicon.ico`,
    favicon: `${siteUrl}/favicon.ico`,
    copyright: `All rights reserved ${new Date().getFullYear()}`,
    feedLinks: {
      rss2: `${siteUrl}/feed.xml`,
    },
  });

  let html = await (await fetch(new URL("/", req.url))).text();
  let $ = cheerio.load(html);

  $("article").each(function () {
    let id = $(this).attr("id");
    assert(typeof id === "string");

    let url = `${siteUrl}/#${id}`;
    let heading = $(this).find("h2").first();
    let title = heading.text();
    let date = $(this).find("time").first().attr("datetime");

    // Tidy content
    heading.remove();
    $(this).find("h3 svg").remove();

    let content = $(this).find("[data-mdx-content]").first().html();

    assert(typeof title === "string");
    assert(typeof date === "string");
    assert(typeof content === "string");

    feed.addItem({
      title,
      id: url,
      link: url,
      content,
      author: [author],
      contributor: [author],
      date: new Date(date),
    });
  });

  return new Response(feed.rss2(), {
    status: 200,
    headers: {
      "content-type": "application/xml",
      "cache-control": "s-maxage=31556952",
    },
  });
}
