import { useState } from "react";
import { PlusCircle, Trash2 } from "lucide-react";

import { RemovableBadge } from "@/components/removable-badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from "@/components/ui/combobox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEnrollmentStore } from "@/lib/enrollment-store";
import type { Course } from "@/lib/types";

const CREATE_PREFIX = "__create__:";

const labelOf = (v: string) =>
  v.startsWith(CREATE_PREFIX)
    ? `+ เพิ่มผู้สอน "${v.slice(CREATE_PREFIX.length)}"`
    : v;

/** Combobox แบบ Multiple: เลือกจากผู้สอนที่มีอยู่ หรือพิมพ์ชื่อใหม่แล้วเลือก "+ เพิ่มผู้สอน" */
function InstructorCombobox({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string[];
  onChange: (value: string[]) => void;
}) {
  const anchor = useComboboxAnchor();
  const [input, setInput] = useState("");

  const q = input.trim();
  const base = Array.from(new Set([...options, ...value]));
  const exists = base.some((o) => o.toLowerCase() === q.toLowerCase());
  const items = q && !exists ? [...base, CREATE_PREFIX + q] : base;

  return (
    <Combobox
      multiple
      autoHighlight
      items={items}
      value={value}
      inputValue={input}
      onInputValueChange={setInput}
      itemToStringLabel={labelOf}
      onValueChange={(next) => {
        const cleaned = next.map((v) =>
          v.startsWith(CREATE_PREFIX) ? v.slice(CREATE_PREFIX.length) : v,
        );
        onChange(Array.from(new Set(cleaned)));
        setInput("");
      }}
    >
      <ComboboxChips ref={anchor}>
        <ComboboxValue>
          {(selected: string[]) => (
            <>
              {selected.map((name) => (
                <ComboboxChip key={name}>{name}</ComboboxChip>
              ))}
              <ComboboxChipsInput
                placeholder={
                  selected.length === 0 ? "เลือกหรือพิมพ์ชื่อผู้สอน" : ""
                }
              />
            </>
          )}
        </ComboboxValue>
      </ComboboxChips>
      <ComboboxContent anchor={anchor}>
        <ComboboxEmpty>ไม่พบผู้สอน</ComboboxEmpty>
        <ComboboxList>
          {(item: string) => (
            <ComboboxItem key={item} value={item}>
              {labelOf(item)}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}

function AddCourseDialog({ courses }: { courses: Course[] }) {
  const addCourse = useEnrollmentStore((s) => s.addCourse);

  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [title, setTitle] = useState("");
  const [instructors, setInstructors] = useState<string[]>([]);

  // ผู้สอนที่มีอยู่แล้วในทุกวิชา (ไม่ซ้ำกัน)
  const instructorOptions = Array.from(
    new Set(courses.flatMap((c) => c.instructors ?? [])),
  );

  const trimmedCode = code.trim();
  const duplicate = trimmedCode
    ? courses.find(
        (c) => c.courseCode.toLowerCase() === trimmedCode.toLowerCase(),
      )
    : undefined;
  const canSave = !!trimmedCode && !!title.trim() && !duplicate;

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) {
      setCode("");
      setTitle("");
      setInstructors([]);
    }
  };

  const handleSave = () => {
    if (!canSave) return;
    addCourse({
      courseCode: trimmedCode.toUpperCase(),
      courseTitle: title.trim(),
      instructors,
    });
    handleOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button />}>
        <PlusCircle className="h-4 w-4" />
        เพิ่มวิชา
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>เพิ่มวิชาใหม่</DialogTitle>
          <DialogDescription>
            วิชาที่เพิ่มจะไปโผล่เป็นตัวเลือกตอนลงทะเบียนให้นักศึกษาได้ทันที
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="courseCode">รหัสวิชา</Label>
            <Input
              id="courseCode"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              aria-invalid={!!duplicate}
              placeholder="เช่น CPE301"
            />
            {duplicate && (
              <p className="text-sm text-destructive">
                มีรหัสวิชา {duplicate.courseCode} นี้แล้ว
              </p>
            )}
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="courseTitle">ชื่อวิชา</Label>
            <Input
              id="courseTitle"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="เช่น Introduction to Programming"
            />
          </div>
          <div className="grid gap-1.5">
            <Label>ผู้สอน</Label>
            <InstructorCombobox
              options={instructorOptions}
              value={instructors}
              onChange={setInstructors}
            />
          </div>
        </div>
        <DialogFooter>
          <Button disabled={!canSave} onClick={handleSave}>
            บันทึก
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminCoursesPage() {
  const courses = useEnrollmentStore((s) => s.courses);
  const removeCourse = useEnrollmentStore((s) => s.removeCourse);
  const removeInstructor = useEnrollmentStore((s) => s.removeInstructor);

  const [toDelete, setToDelete] = useState<Course | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h1 className="text-xl font-semibold">จัดการวิชาเรียน</h1>
          <p className="text-sm text-muted-foreground">
            {courses.length} วิชา — เพิ่มวิชาใหม่ที่นี่
            วิชาจะไปโผล่เป็นตัวเลือกตอนลงทะเบียนให้นักศึกษาที่หน้า
            "จัดการการลงทะเบียน" ทันที
          </p>
        </div>
        <AddCourseDialog courses={courses} />
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>รหัสวิชา</TableHead>
              <TableHead>ชื่อวิชา</TableHead>
              <TableHead>ผู้สอน</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {courses.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="h-20 text-center text-muted-foreground"
                >
                  ยังไม่มีวิชา
                </TableCell>
              </TableRow>
            )}
            {courses.map((c) => (
              <TableRow key={c.courseCode}>
                <TableCell>{c.courseCode}</TableCell>
                <TableCell>{c.courseTitle}</TableCell>
                <TableCell className="whitespace-normal">
                  {c.instructors && c.instructors.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {c.instructors.map((name) => (
                        <RemovableBadge
                          key={name}
                          label={name}
                          removeLabel={`ลบผู้สอน ${name}`}
                          onRemove={() => removeInstructor(c.courseCode, name)}
                        />
                      ))}
                    </div>
                  ) : (
                    <span className="text-muted-foreground">ยังไม่มีผู้สอน</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    aria-label={`ลบวิชา ${c.courseCode}`}
                    onClick={() => setToDelete(c)}
                  >
                    <Trash2 />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog
        open={toDelete !== null}
        onOpenChange={(open) => {
          if (!open) setToDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ลบวิชา {toDelete?.courseCode}?</AlertDialogTitle>
            <AlertDialogDescription>
              วิชา {toDelete?.courseCode} — {toDelete?.courseTitle}{" "}
              จะถูกลบ และถูกเอาออกจากรายวิชาที่นักศึกษาลงทะเบียนไว้ด้วย
              การกระทำนี้ไม่สามารถย้อนกลับได้
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                if (toDelete) removeCourse(toDelete.courseCode);
                setToDelete(null);
              }}
            >
              ลบวิชา
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
