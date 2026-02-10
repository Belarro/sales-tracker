/**
 * Zod validation schemas for Notion data types
 */
import { z } from 'zod';

// Notion ID formats (32 character hex strings)
export const NotionPageId = z
  .string()
  .regex(/^[a-f0-9]{32}$/, 'Invalid Notion page ID format');

export const NotionDatabaseId = z
  .string()
  .regex(/^[a-f0-9]{32}$/, 'Invalid Notion database ID format');

export const NotionBlockId = z
  .string()
  .regex(/^[a-f0-9]{32}$/, 'Invalid Notion block ID format');

// Rich text schema
export const RichTextSchema = z.object({
  type: z.literal('text'),
  text: z.object({
    content: z.string(),
    link: z
      .object({
        url: z.string().url(),
      })
      .optional(),
  }),
  annotations: z
    .object({
      bold: z.boolean().optional(),
      italic: z.boolean().optional(),
      strikethrough: z.boolean().optional(),
      underline: z.boolean().optional(),
      code: z.boolean().optional(),
      color: z.string().optional(),
    })
    .optional(),
  plain_text: z.string().optional(),
  href: z.string().url().optional(),
});

// Block schemas
export const ParagraphBlockSchema = z.object({
  type: z.literal('paragraph'),
  paragraph: z.object({
    rich_text: z.array(RichTextSchema),
    color: z.string().optional(),
  }),
});

export const Heading1BlockSchema = z.object({
  type: z.literal('heading_1'),
  heading_1: z.object({
    rich_text: z.array(RichTextSchema),
    color: z.string().optional(),
  }),
});

export const Heading2BlockSchema = z.object({
  type: z.literal('heading_2'),
  heading_2: z.object({
    rich_text: z.array(RichTextSchema),
    color: z.string().optional(),
  }),
});

export const Heading3BlockSchema = z.object({
  type: z.literal('heading_3'),
  heading_3: z.object({
    rich_text: z.array(RichTextSchema),
    color: z.string().optional(),
  }),
});

export const CodeBlockSchema = z.object({
  type: z.literal('code'),
  code: z.object({
    rich_text: z.array(RichTextSchema),
    language: z.string(),
    caption: z.array(RichTextSchema).optional(),
  }),
});

export const BulletedListItemSchema = z.object({
  type: z.literal('bulleted_list_item'),
  bulleted_list_item: z.object({
    rich_text: z.array(RichTextSchema),
    color: z.string().optional(),
    children: z.array(z.any()).optional(),
  }),
});

export const NumberedListItemSchema = z.object({
  type: z.literal('numbered_list_item'),
  numbered_list_item: z.object({
    rich_text: z.array(RichTextSchema),
    color: z.string().optional(),
    children: z.array(z.any()).optional(),
  }),
});

export const TodoBlockSchema = z.object({
  type: z.literal('to_do'),
  to_do: z.object({
    rich_text: z.array(RichTextSchema),
    checked: z.boolean().optional(),
    color: z.string().optional(),
    children: z.array(z.any()).optional(),
  }),
});

export const BlockSchema = z.discriminatedUnion('type', [
  ParagraphBlockSchema,
  Heading1BlockSchema,
  Heading2BlockSchema,
  Heading3BlockSchema,
  CodeBlockSchema,
  BulletedListItemSchema,
  NumberedListItemSchema,
  TodoBlockSchema,
]);

// Parent schemas
export const PageParentSchema = z.object({
  type: z.literal('page_id'),
  page_id: NotionPageId,
});

export const DatabaseParentSchema = z.object({
  type: z.literal('database_id'),
  database_id: NotionDatabaseId,
});

export const WorkspaceParentSchema = z.object({
  type: z.literal('workspace'),
  workspace: z.literal(true),
});

export const ParentSchema = z.discriminatedUnion('type', [
  PageParentSchema,
  DatabaseParentSchema,
  WorkspaceParentSchema,
]);

// Icon schemas
export const EmojiIconSchema = z.object({
  type: z.literal('emoji'),
  emoji: z.string(),
});

export const ExternalIconSchema = z.object({
  type: z.literal('external'),
  external: z.object({
    url: z.string().url(),
  }),
});

export const IconSchema = z.discriminatedUnion('type', [
  EmojiIconSchema,
  ExternalIconSchema,
]);

// Cover schema
export const CoverSchema = z.object({
  type: z.literal('external'),
  external: z.object({
    url: z.string().url(),
  }),
});

// Filter and sort schemas
export const FilterSchema = z.any(); // Complex Notion filter structure

export const SortSchema = z.object({
  property: z.string(),
  direction: z.enum(['ascending', 'descending']),
});

// Search filter schema
export const SearchFilterSchema = z.object({
  value: z.enum(['page', 'database']),
  property: z.literal('object'),
});

export const SearchSortSchema = z.object({
  direction: z.enum(['ascending', 'descending']),
  timestamp: z.enum(['last_edited_time']),
});
