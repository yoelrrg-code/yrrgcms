import { pgTable, text, timestamp, jsonb, integer, uuid, pgEnum, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ============================================================
// ENUMS
// ============================================================

export const userRoleEnum = pgEnum("user_role", ["admin", "author"]);
export const pageStatusEnum = pgEnum("page_status", ["draft", "published"]);
export const postStatusEnum = pgEnum("post_status", ["draft", "published"]);
export const menuLocationEnum = pgEnum("menu_location", ["header", "footer", "sidebar"]);
export const menuItemTargetEnum = pgEnum("menu_item_target", ["_self", "_blank"]);
export const formFieldTypeEnum = pgEnum("form_field_type", [
  "text", "email", "textarea", "select", "checkbox", "radio", "number", "tel", "url", "date"
]);

// ============================================================
// USERS
// ============================================================

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: userRoleEnum("role").notNull().default("author"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  lastLogin: timestamp("last_login"),
});

// ============================================================
// PAGES
// ============================================================

export const pages = pgTable("pages", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  status: pageStatusEnum("status").notNull().default("draft"),
  // Template identifier for the render engine
  template: text("template").notNull().default("default"),
  // Array of { id, type, props } block objects
  blocks: jsonb("blocks").notNull().default([]),
  // SEO fields: { title, description, ogImage, noIndex }
  seo: jsonb("seo").notNull().default({}),
  // ISR revalidation in seconds (0 = on-demand only)
  revalidate: integer("revalidate").notNull().default(60),
  authorId: uuid("author_id").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  publishedAt: timestamp("published_at"),
});

// ============================================================
// CATEGORIES
// ============================================================

export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  // Self-reference for hierarchical categories
  parentId: uuid("parent_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ============================================================
// TAGS
// ============================================================

export const tags = pgTable("tags", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ============================================================
// POSTS
// ============================================================

export const posts = pgTable("posts", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  // Tiptap JSON content
  content: jsonb("content").notNull().default({}),
  excerpt: text("excerpt"),
  featuredImageUrl: text("featured_image_url"),
  status: postStatusEnum("status").notNull().default("draft"),
  // SEO fields: { title, description, ogImage, noIndex }
  seo: jsonb("seo").notNull().default({}),
  authorId: uuid("author_id").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  publishedAt: timestamp("published_at"),
});

// ============================================================
// PIVOT TABLES: Post ↔ Categories / Tags
// ============================================================

export const postCategories = pgTable("post_categories", {
  postId: uuid("post_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
  categoryId: uuid("category_id").notNull().references(() => categories.id, { onDelete: "cascade" }),
});

export const postTags = pgTable("post_tags", {
  postId: uuid("post_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
  tagId: uuid("tag_id").notNull().references(() => tags.id, { onDelete: "cascade" }),
});

// ============================================================
// FORMS
// ============================================================

export const forms = pgTable("forms", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  // Array of { id, type, label, placeholder, required, options[] }
  fields: jsonb("fields").notNull().default([]),
  // Email to notify on submission
  notifyEmail: text("notify_email"),
  successMessage: text("success_message").notNull().default("Thank you! We'll be in touch."),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const formSubmissions = pgTable("form_submissions", {
  id: uuid("id").primaryKey().defaultRandom(),
  formId: uuid("form_id").notNull().references(() => forms.id, { onDelete: "cascade" }),
  // Key-value pairs matching the form fields
  data: jsonb("data").notNull(),
  ip: text("ip"),
  userAgent: text("user_agent"),
  submittedAt: timestamp("submitted_at").notNull().defaultNow(),
});

// ============================================================
// MENUS
// ============================================================

export const menus = pgTable("menus", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  location: menuLocationEnum("location").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const menuItems = pgTable("menu_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  menuId: uuid("menu_id").notNull().references(() => menus.id, { onDelete: "cascade" }),
  label: text("label").notNull(),
  // External URL or null (if linking to a page)
  url: text("url"),
  // Internal page reference
  pageId: uuid("page_id").references(() => pages.id, { onDelete: "set null" }),
  // For nested items (submenus)
  parentId: uuid("parent_id"),
  order: integer("order").notNull().default(0),
  target: menuItemTargetEnum("target").notNull().default("_self"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ============================================================
// MEDIA
// ============================================================

export const media = pgTable("media", {
  id: uuid("id").primaryKey().defaultRandom(),
  filename: text("filename").notNull(),
  // Vercel Blob URL
  url: text("url").notNull(),
  alt: text("alt").notNull().default(""),
  mimeType: text("mime_type").notNull(),
  size: integer("size").notNull(), // bytes
  width: integer("width"),
  height: integer("height"),
  uploadedBy: uuid("uploaded_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ============================================================
// GLOBALS (Header, Footer, SEO Defaults)
// ============================================================

export const globals = pgTable("globals", {
  // key is the identifier: 'header' | 'footer' | 'seo_defaults'
  key: text("key").primaryKey(),
  // Flexible JSONB blob per global
  value: jsonb("value").notNull().default({}),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ============================================================
// THEMES
// ============================================================

export const themes = pgTable("themes", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  isActive: boolean("is_active").notNull().default(false),
  config: jsonb("config").notNull().default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ============================================================
// SERVICES & APPOINTMENTS MODULE
// ============================================================

export const serviceStatusEnum = pgEnum("service_status", ["draft", "active", "inactive"]);
export const bookingTypeEnum = pgEnum("booking_type", ["single", "pack", "subscription"]);
export const appointmentStatusEnum = pgEnum("appointment_status", ["confirmed", "completed", "cancelled", "no_show"]);
export const appointmentPaymentStatusEnum = pgEnum("appointment_payment_status", ["pending_onsite", "paid"]);

export const services = pgTable("services", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  shortDescription: text("short_description"),
  detailedDescription: jsonb("detailed_description").notNull().default({}),
  mainImage: text("main_image"),
  gallery: jsonb("gallery").notNull().default([]),
  categoryId: uuid("category_id").references(() => categories.id, { onDelete: "set null" }),
  status: serviceStatusEnum("status").notNull().default("draft"),
  tags: jsonb("tags").notNull().default([]),
  durationMinutes: integer("duration_minutes").notNull().default(45),
  bufferTimeMinutes: integer("buffer_time_minutes").notNull().default(15),
  pricingOptions: jsonb("pricing_options").notNull().default({
    singleSession: { durationMinutes: 45, price: 30000, currency: "CLP" },
    packs: [],
    subscriptions: []
  }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const availabilitySettings = pgTable("availability_settings", {
  id: uuid("id").primaryKey().defaultRandom(),
  serviceId: uuid("service_id").references(() => services.id, { onDelete: "cascade" }),
  weeklySchedule: jsonb("weekly_schedule").notNull().default([
    { day: 1, active: true, slots: [{ start: "09:00", end: "18:00" }] },
    { day: 2, active: true, slots: [{ start: "09:00", end: "18:00" }] },
    { day: 3, active: true, slots: [{ start: "09:00", end: "18:00" }] },
    { day: 4, active: true, slots: [{ start: "09:00", end: "18:00" }] },
    { day: 5, active: true, slots: [{ start: "09:00", end: "18:00" }] },
    { day: 6, active: false, slots: [] },
    { day: 0, active: false, slots: [] }
  ]),
  allowWeekends: boolean("allow_weekends").notNull().default(false),
  countryHolidays: jsonb("country_holidays").notNull().default(["CL"]),
  customDisabledDates: jsonb("custom_disabled_dates").notNull().default([]),
  workStartHour: text("work_start_hour"),
  workEndHour: text("work_end_hour"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const availabilityExceptions = pgTable("availability_exceptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  serviceId: uuid("service_id").references(() => services.id, { onDelete: "cascade" }),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  isFullDay: boolean("is_full_day").notNull().default(true),
  reason: text("reason"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const appointments = pgTable("appointments", {
  id: uuid("id").primaryKey().defaultRandom(),
  serviceId: uuid("service_id").references(() => services.id, { onDelete: "cascade" }).notNull(),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone").notNull(),
  customerNotes: text("customer_notes"),
  bookingType: bookingTypeEnum("booking_type").notNull().default("single"),
  selectedPricingOptionId: text("selected_pricing_option_id"),
  status: appointmentStatusEnum("status").notNull().default("confirmed"),
  paymentStatus: appointmentPaymentStatusEnum("payment_status").notNull().default("pending_onsite"),
  totalAmount: integer("total_amount").notNull().default(0),
  currency: text("currency").notNull().default("CLP"),
  sessionsDates: jsonb("sessions_dates").notNull().default([]),
  prepaidMonths: integer("prepaid_months"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const holidaysCache = pgTable("holidays_cache", {
  id: uuid("id").primaryKey().defaultRandom(),
  countryCode: text("country_code").notNull(),
  date: text("date").notNull(),
  name: text("name").notNull(),
});

// ============================================================
// RELATIONS
// ============================================================

export const usersRelations = relations(users, ({ many }) => ({
  pages: many(pages),
  posts: many(posts),
  media: many(media),
}));

export const pagesRelations = relations(pages, ({ one }) => ({
  author: one(users, { fields: [pages.authorId], references: [users.id] }),
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
  author: one(users, { fields: [posts.authorId], references: [users.id] }),
  postCategories: many(postCategories),
  postTags: many(postTags),
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  parent: one(categories, { fields: [categories.parentId], references: [categories.id], relationName: "parent" }),
  children: many(categories, { relationName: "parent" }),
  postCategories: many(postCategories),
  services: many(services),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
  postTags: many(postTags),
}));

export const postCategoriesRelations = relations(postCategories, ({ one }) => ({
  post: one(posts, { fields: [postCategories.postId], references: [posts.id] }),
  category: one(categories, { fields: [postCategories.categoryId], references: [categories.id] }),
}));

export const postTagsRelations = relations(postTags, ({ one }) => ({
  post: one(posts, { fields: [postTags.postId], references: [posts.id] }),
  tag: one(tags, { fields: [postTags.tagId], references: [tags.id] }),
}));

export const formsRelations = relations(forms, ({ many }) => ({
  submissions: many(formSubmissions),
}));

export const formSubmissionsRelations = relations(formSubmissions, ({ one }) => ({
  form: one(forms, { fields: [formSubmissions.formId], references: [forms.id] }),
}));

export const menusRelations = relations(menus, ({ many }) => ({
  items: many(menuItems),
}));

export const menuItemsRelations = relations(menuItems, ({ one }) => ({
  menu: one(menus, { fields: [menuItems.menuId], references: [menus.id] }),
  page: one(pages, { fields: [menuItems.pageId], references: [pages.id] }),
}));

export const mediaRelations = relations(media, ({ one }) => ({
  uploadedBy: one(users, { fields: [media.uploadedBy], references: [users.id] }),
}));

export const servicesRelations = relations(services, ({ one, many }) => ({
  category: one(categories, { fields: [services.categoryId], references: [categories.id] }),
  availabilitySettings: many(availabilitySettings),
  availabilityExceptions: many(availabilityExceptions),
  appointments: many(appointments),
}));

export const availabilitySettingsRelations = relations(availabilitySettings, ({ one }) => ({
  service: one(services, { fields: [availabilitySettings.serviceId], references: [services.id] }),
}));

export const availabilityExceptionsRelations = relations(availabilityExceptions, ({ one }) => ({
  service: one(services, { fields: [availabilityExceptions.serviceId], references: [services.id] }),
}));

export const appointmentsRelations = relations(appointments, ({ one }) => ({
  service: one(services, { fields: [appointments.serviceId], references: [services.id] }),
}));

// ============================================================
// TESTIMONIALS
// ============================================================

export const testimonials = pgTable("testimonials", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  role: text("role"), // e.g. "CEO at Company" or "Customer"
  avatarUrl: text("avatar_url"),
  content: text("content").notNull(),
  rating: integer("rating").notNull().default(5),
  isFeatured: boolean("is_featured").notNull().default(false),
  order: integer("order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type Testimonial = typeof testimonials.$inferSelect;
export type NewTestimonial = typeof testimonials.$inferInsert;

// ============================================================
// MARKETING & CAMPAIGNS
// ============================================================

export const campaignStatusEnum = pgEnum("campaign_status", ["draft", "scheduled", "published", "failed"]);
export const socialPlatformEnum = pgEnum("social_platform", ["facebook", "instagram"]);

export const campaigns = pgTable("campaigns", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  sourceType: text("source_type").notNull().default("custom"), // "post" | "page" | "service" | "custom"
  sourceId: text("source_id"),
  status: campaignStatusEnum("status").notNull().default("draft"),
  emailSubject: text("email_subject"),
  emailHtmlContent: text("email_html_content"),
  scheduledAt: timestamp("scheduled_at"),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const socialPosts = pgTable("social_posts", {
  id: uuid("id").primaryKey().defaultRandom(),
  campaignId: uuid("campaign_id").references(() => campaigns.id, { onDelete: "cascade" }),
  platform: socialPlatformEnum("platform").notNull(),
  caption: text("caption").notNull(),
  imageUrl: text("image_url"),
  status: campaignStatusEnum("status").notNull().default("draft"),
  metaPostId: text("meta_post_id"),
  errorMessage: text("error_message"),
  scheduledAt: timestamp("scheduled_at"),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const campaignsRelations = relations(campaigns, ({ many }) => ({
  socialPosts: many(socialPosts),
}));

export const socialPostsRelations = relations(socialPosts, ({ one }) => ({
  campaign: one(campaigns, { fields: [socialPosts.campaignId], references: [campaigns.id] }),
}));

export type Campaign = typeof campaigns.$inferSelect;
export type NewCampaign = typeof campaigns.$inferInsert;
export type SocialPost = typeof socialPosts.$inferSelect;
export type NewSocialPost = typeof socialPosts.$inferInsert;

// ============================================================
// TYPE EXPORTS
// ============================================================

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Page = typeof pages.$inferSelect;
export type NewPage = typeof pages.$inferInsert;
export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
export type Tag = typeof tags.$inferSelect;
export type NewTag = typeof tags.$inferInsert;
export type Form = typeof forms.$inferSelect;
export type NewForm = typeof forms.$inferInsert;
export type FormSubmission = typeof formSubmissions.$inferSelect;
export type Menu = typeof menus.$inferSelect;
export type MenuItem = typeof menuItems.$inferSelect;
export type Media = typeof media.$inferSelect;
export type Global = typeof globals.$inferSelect;
export type Theme = typeof themes.$inferSelect;
export type NewTheme = typeof themes.$inferInsert;
export type Service = typeof services.$inferSelect;
export type NewService = typeof services.$inferInsert;
export type AvailabilitySetting = typeof availabilitySettings.$inferSelect;
export type NewAvailabilitySetting = typeof availabilitySettings.$inferInsert;
export type AvailabilityException = typeof availabilityExceptions.$inferSelect;
export type NewAvailabilityException = typeof availabilityExceptions.$inferInsert;
export type Appointment = typeof appointments.$inferSelect;
export type NewAppointment = typeof appointments.$inferInsert;
export type HolidayCache = typeof holidaysCache.$inferSelect;


