import { Client } from "@notionhq/client";

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

export const getDatabase = async databaseId => {
  const response = await notion.databases.query({
    database_id: databaseId,
  });
  return response.results;
};

export const queryDatabase = async (databaseId, filter) => {
  const response = await notion.databases.query({
    database_id: databaseId,
    filter: filter,
  });
  return response.results;
};

export const getPage = async pageId => {
  const response = await notion.pages.retrieve({ page_id: pageId });
  return response;
};

export const getPropertyValue = async ({ pageId, propertyId }) => {
  const propertyItem = await notion.pages.properties.retrieve({
    page_id: pageId,
    property_id: propertyId,
  });
  if (propertyItem.object === "property_item") {
    return propertyItem;
  }

  let nextCursor = propertyItem.next_cursor;
  const results = propertyItem.results;

  while (nextCursor !== null) {
    const propertyItem = await notion.pages.properties.retrieve({
      page_id: pageId,
      property_id: propertyId,
      start_cursor: nextCursor,
    });

    if (propertyItem.object === "property_item") {
      return propertyItem;
    }
    nextCursor = propertyItem.next_cursor;
    results.push(...propertyItem.results);
  }

  return results;
};

export const getBlocks = async blockId => {
  const blocks = [];
  let cursor;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { results, next_cursor } = await notion.blocks.children.list({
      start_cursor: cursor,
      block_id: blockId,
    });
    blocks.push(...results);
    if (!next_cursor) {
      break;
    }
    cursor = next_cursor;
  }
  return blocks;
};
