import type { Config } from "@netlify/functions";
import { getStore } from "@netlify/blobs";
import { eq, inArray, sql, and, gt } from "drizzle-orm";
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { db } from "../../db/index.js";
import { admins, books, students, type IssueRecord } from "../../db/schema.js";

// Library Management System API.
// Replaces the former Express + MongoDB server: data lives in Netlify Database,
// book cover photos and page images live in Netlify Blobs.

const MAX_ISSUE_LIMIT = 30;
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const images = () => getStore("book-images");

// =====================================================
// HELPERS
// =====================================================
const json = (status: number, body: unknown) => Response.json(body, { status });
const fail = (status: number, message: string) => json(status, { success: false, message });

const today = () => new Date().toISOString().split("T")[0];

const hashPassword = (password: string) => {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
};

const verifyPassword = (password: string, stored: string) => {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const expected = Buffer.from(hash, "hex");
  const actual = scryptSync(password, salt, expected.length);
  return timingSafeEqual(expected, actual);
};

// Default student password is the DOB reversed (e.g. 2005-08-15 -> 15082005)
const defaultStudentPassword = (dob: string) => dob.split("-").reverse().join("");

const publicStudent = (s: typeof students.$inferSelect) => ({
  _id: s.id,
  name: s.name,
  email: s.email,
  dob: s.dob,
  mobile: s.mobile,
  regd_no: s.regdNo,
  issue: s.issue,
  submit: s.submit,
});

const publicBook = (b: typeof books.$inferSelect) => ({
  _id: b.id,
  name: b.name,
  author: b.author,
  quantity: b.quantity,
  description: b.description,
  pageCount: b.pageCount,
  createdAt: b.createdAt,
  updatedAt: b.updatedAt,
});

const readBody = async (req: Request): Promise<Record<string, any>> => {
  const type = req.headers.get("content-type") || "";
  try {
    if (type.includes("application/json")) return await req.json();
    if (type.includes("form")) return Object.fromEntries((await req.formData()).entries());
  } catch {
    // fall through to empty body
  }
  return {};
};

const findStudentByEmail = async (email: string) => {
  const [student] = await db
    .select()
    .from(students)
    .where(eq(students.email, String(email).toLowerCase().trim()));
  return student;
};

// Seeds the default admin account the first time someone tries to log in.
const ensureDefaultAdmin = async () => {
  const email = (process.env.ADMIN_EMAIL || "admin@gmail.com").toLowerCase().trim();
  const password = process.env.ADMIN_PASSWORD || "admin1234";
  await db
    .insert(admins)
    .values({ name: "Admin", email, passwordHash: hashPassword(password) })
    .onConflictDoNothing();
};

const serveImage = async (key: string, notFound: string) => {
  const entry = await images().getWithMetadata(key, { type: "arrayBuffer" });
  if (!entry) return fail(404, notFound);
  return new Response(entry.data, {
    headers: {
      "Content-Type": String(entry.metadata?.contentType || "image/jpeg"),
      "Cache-Control": "public, max-age=3600",
    },
  });
};

// =====================================================
// ROUTE HANDLERS
// =====================================================
const adminLogin = async (req: Request) => {
  const { email, password } = await readBody(req);
  if (!email || !password) return fail(400, "Email and password are required.");

  await ensureDefaultAdmin();

  const [admin] = await db
    .select()
    .from(admins)
    .where(eq(admins.email, String(email).toLowerCase().trim()));

  if (!admin || !verifyPassword(String(password), admin.passwordHash)) {
    return fail(401, "Invalid email or password.");
  }

  return json(200, {
    success: true,
    message: "Admin login successful.",
    data: { id: admin.id, name: admin.name, email: admin.email },
  });
};

const studentLogin = async (req: Request) => {
  const { email, password } = await readBody(req);
  if (!email || !password) return fail(400, "Email and password are required.");

  const student = await findStudentByEmail(email);
  if (!student || !verifyPassword(String(password), student.passwordHash)) {
    return fail(401, "Invalid email or password.");
  }

  return json(200, {
    success: true,
    message: "Student login successful.",
    data: {
      id: student.id,
      name: student.name,
      email: student.email,
      regd_no: student.regdNo,
      mobile: student.mobile,
      dob: student.dob,
    },
  });
};

const listStudents = async () => {
  const rows = await db.select().from(students).orderBy(students.id);
  return json(200, {
    success: true,
    message: "Students fetched successfully.",
    data: rows.map(publicStudent),
  });
};

const addStudent = async (req: Request) => {
  const { name, email, dob, mobile } = await readBody(req);
  if (!name || !email || !dob || !mobile) return fail(400, "All fields are required.");

  const cleanEmail = String(email).toLowerCase().trim();
  if (await findStudentByEmail(cleanEmail)) return fail(400, "Email already exists.");

  const defaultPassword = defaultStudentPassword(String(dob));

  const [student] = await db
    .insert(students)
    .values({
      name: String(name).trim(),
      email: cleanEmail,
      dob: String(dob),
      mobile: String(mobile),
      passwordHash: hashPassword(defaultPassword),
    })
    .returning();

  return json(201, {
    success: true,
    message: "Student added successfully.",
    data: {
      id: student.id,
      name: student.name,
      email: student.email,
      dob: student.dob,
      mobile: student.mobile,
      regd_no: student.regdNo,
      defaultPassword,
    },
  });
};

const deleteStudent = async (url: URL) => {
  const name = url.searchParams.get("name");
  const email = url.searchParams.get("email");
  if (!email) return fail(400, "Email is required.");

  const student = await findStudentByEmail(email);
  if (!student) return fail(404, "Student not found.");

  await db.delete(students).where(eq(students.id, student.id));

  return json(200, {
    success: true,
    message: `Student ${name || student.name} deleted successfully.`,
  });
};

const listBooks = async () => {
  const rows = await db.select().from(books).orderBy(books.id);
  return json(200, {
    success: true,
    message: "Books fetched successfully.",
    data: rows.map(publicBook),
  });
};

const singleBook = async (id: number) => {
  const [book] = await db.select().from(books).where(eq(books.id, id));
  if (!book) return fail(404, "Book not found.");
  return json(200, { success: true, message: "Book fetched successfully.", data: publicBook(book) });
};

const addBook = async (req: Request) => {
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return fail(400, "Invalid form data.");
  }

  const name = String(form.get("name") || "").trim();
  const author = String(form.get("author") || "").trim();
  const quantity = String(form.get("quantity") || "");
  const description = String(form.get("description") || "").trim();

  if (!name || !author || !quantity || !description) {
    return fail(400, "All fields are required.");
  }

  const photo = form.get("photo");
  if (!(photo instanceof File) || photo.size === 0) return fail(400, "Book image is required.");

  const pages = form.getAll("pages").filter((p): p is File => p instanceof File && p.size > 0);

  if ([photo, ...pages].some((f) => f.size > MAX_FILE_SIZE)) {
    return fail(400, "Each image must be 5MB or smaller.");
  }

  const [existing] = await db.select({ id: books.id }).from(books).where(eq(books.name, name));
  if (existing) return fail(400, "Book with this name already exists.");

  const [book] = await db
    .insert(books)
    .values({ name, author, quantity: Number(quantity), description, pageCount: pages.length })
    .returning();

  const store = images();
  await store.set(`photo/${book.id}`, await photo.arrayBuffer(), {
    metadata: { contentType: photo.type || "image/jpeg" },
  });
  await Promise.all(
    pages.map(async (page, i) =>
      store.set(`page/${book.id}/${i}`, await page.arrayBuffer(), {
        metadata: { contentType: page.type || "image/jpeg" },
      })
    )
  );

  return json(201, { success: true, message: "Book added successfully.", data: publicBook(book) });
};

const deleteBook = async (url: URL) => {
  const name = url.searchParams.get("name");
  if (!name) return fail(400, "Book name is required.");

  const [book] = await db.select().from(books).where(eq(books.name, name));
  if (!book) return fail(404, "Book not found.");

  await db.delete(books).where(eq(books.id, book.id));

  const store = images();
  await Promise.all([
    store.delete(`photo/${book.id}`),
    ...Array.from({ length: book.pageCount }, (_, i) => store.delete(`page/${book.id}/${i}`)),
  ]);

  return json(200, { success: true, message: "Book deleted successfully." });
};

// Supports single book (bookName) or batch (books array).
// Enforces a max of 30 books issued per student.
const issueBook = async (req: Request) => {
  const { studentEmail, bookName, books: bookList, dueDate } = await readBody(req);

  let bookNames: string[] = [];
  if (Array.isArray(bookList) && bookList.length > 0) {
    bookNames = bookList.map((b) => String(b).trim()).filter(Boolean);
  } else if (bookName) {
    bookNames = [String(bookName).trim()];
  }

  if (!studentEmail || bookNames.length === 0) {
    return fail(400, "Student email and at least one book name are required.");
  }

  const student = await findStudentByEmail(studentEmail);
  if (!student) return fail(404, "Student not found.");

  const currentlyIssued = student.issue.length;
  const remaining = MAX_ISSUE_LIMIT - currentlyIssued;

  if (remaining <= 0) {
    return fail(
      400,
      `Student already has ${currentlyIssued} book(s) issued. Maximum limit is ${MAX_ISSUE_LIMIT}.`
    );
  }
  if (bookNames.length > remaining) {
    return fail(
      400,
      `Cannot issue ${bookNames.length} book(s). Student can take only ${remaining} more book(s) (max ${MAX_ISSUE_LIMIT}).`
    );
  }

  const uniqueNames = [...new Set(bookNames)];
  const booksFound = await db.select().from(books).where(inArray(books.name, uniqueNames));
  if (booksFound.length !== uniqueNames.length) {
    return fail(404, "One or more books were not found.");
  }

  const alreadyIssued: string[] = [];
  const outOfStock: string[] = [];
  const validBooks: (typeof books.$inferSelect)[] = [];

  for (const book of booksFound) {
    const isAlreadyIssued = student.issue.some(
      (item) => item.bookName?.toLowerCase() === book.name.toLowerCase()
    );
    if (isAlreadyIssued) alreadyIssued.push(book.name);
    else if (book.quantity <= 0) outOfStock.push(book.name);
    else validBooks.push(book);
  }

  if (alreadyIssued.length > 0 || outOfStock.length > 0) {
    let message = "Issue failed.";
    if (alreadyIssued.length > 0) message += ` Already issued to student: ${alreadyIssued.join(", ")}.`;
    if (outOfStock.length > 0) message += ` Out of stock: ${outOfStock.join(", ")}.`;
    return fail(400, message);
  }

  const issueDate = today();
  const computedDueDate =
    dueDate || new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  // Decrement stock; skip any book that ran out in the meantime
  const issued: IssueRecord[] = [];
  for (const book of validBooks) {
    const updated = await db
      .update(books)
      .set({ quantity: sql`${books.quantity} - 1`, updatedAt: new Date() })
      .where(and(eq(books.id, book.id), gt(books.quantity, 0)))
      .returning({ id: books.id });
    if (updated.length > 0) {
      issued.push({
        bookId: book.id,
        bookName: book.name,
        issueDate,
        dueDate: computedDueDate,
        status: "Issued",
      });
    }
  }

  if (issued.length === 0) return fail(400, "No valid books to issue.");

  await db
    .update(students)
    .set({ issue: sql`${students.issue} || ${JSON.stringify(issued)}::jsonb` })
    .where(eq(students.id, student.id));

  return json(200, {
    success: true,
    message: `${issued.length} book(s) issued successfully.`,
    data: { books: issued.map((r) => r.bookName), issueDate, dueDate: computedDueDate },
  });
};

const submitBook = async (req: Request) => {
  const { studentEmail, bookName } = await readBody(req);
  if (!studentEmail || !bookName) return fail(400, "Student email and book name are required.");

  const student = await findStudentByEmail(studentEmail);
  if (!student) return fail(404, "Student not found.");

  const target = String(bookName).trim().toLowerCase();
  const record = student.issue.find((item) => item.bookName?.toLowerCase() === target);
  if (!record) return fail(400, "This book is not issued to the student.");

  const submitDate = today();

  await db
    .update(students)
    .set({
      issue: student.issue.filter((item) => item !== record),
      submit: [...student.submit, { ...record, submitDate, status: "Submitted" }],
    })
    .where(eq(students.id, student.id));

  await db
    .update(books)
    .set({ quantity: sql`${books.quantity} + 1`, updatedAt: new Date() })
    .where(eq(books.name, record.bookName));

  return json(200, {
    success: true,
    message: "Book submitted successfully.",
    data: { bookName, submitDate },
  });
};

const stats = async () => {
  const [[studentCount], [bookCount], [issuedCount]] = await Promise.all([
    db.select({ n: sql<number>`count(*)::int` }).from(students),
    db.select({ n: sql<number>`count(*)::int` }).from(books),
    db
      .select({ n: sql<number>`coalesce(sum(jsonb_array_length(${students.issue})), 0)::int` })
      .from(students),
  ]);

  return json(200, {
    success: true,
    data: {
      totalStudents: studentCount.n,
      totalBooks: bookCount.n,
      booksIssued: issuedCount.n,
    },
  });
};

// =====================================================
// ROUTER
// =====================================================
export default async (req: Request) => {
  const url = new URL(req.url);
  const path = url.pathname.replace(/^\/api/, "").replace(/\/$/, "") || "/";
  const method = req.method;

  try {
    if (method === "POST" && path === "/admin/login") return await adminLogin(req);
    if (method === "POST" && path === "/student/login") return await studentLogin(req);

    if (method === "GET" && path === "/students") return await listStudents();
    if (method === "POST" && path === "/addstudents") return await addStudent(req);
    if (method === "DELETE" && path === "/deletestudent") return await deleteStudent(url);

    if (method === "GET" && path === "/allbooks") return await listBooks();
    if (method === "POST" && path === "/allbooks") return await addBook(req);
    if (method === "DELETE" && path === "/deletebook") return await deleteBook(url);

    if (method === "POST" && path === "/issuebook") return await issueBook(req);
    if (method === "POST" && path === "/submitbook") return await submitBook(req);
    if (method === "GET" && path === "/stats") return await stats();

    let match = path.match(/^\/singlebook\/(\d+)$/);
    if (method === "GET" && match) return await singleBook(Number(match[1]));

    match = path.match(/^\/bookphoto\/(\d+)$/);
    if (method === "GET" && match) return await serveImage(`photo/${match[1]}`, "Book photo not found.");

    match = path.match(/^\/bookpage\/(\d+)\/(\d+)$/);
    if (method === "GET" && match) {
      return await serveImage(`page/${match[1]}/${match[2]}`, "Page not found.");
    }

    return fail(404, "Route not found.");
  } catch (err) {
    console.error("API Error:", err);
    return fail(500, err instanceof Error ? err.message : "Internal Server Error.");
  }
};

export const config: Config = {
  path: "/api/*",
};
