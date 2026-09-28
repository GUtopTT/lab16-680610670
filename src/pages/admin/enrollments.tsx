import { useState } from "react";
import { PlusCircle } from "lucide-react";

import { RemovableBadge } from "@/components/removable-badge";
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEnrollmentStore } from "@/lib/enrollment-store";
import type { Student } from "@/lib/types";

type Option = { value: string; label: string };

function OptionSelect({
  id,
  options,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  options: Option[];
  value: string | null;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <Select
      items={options}
      value={value}
      onValueChange={(v) => onChange(v as string)}
    >
      <SelectTrigger id={id} className="w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

const fullName = (s: Student) => `${s.firstName} ${s.lastName}`;

/** Combobox แบบ Multiple สำหรับเลือกนักศึกษา (ค่าที่เก็บคือ studentId) */
function StudentCombobox({
  students,
  value,
  onChange,
  disabled,
  placeholder,
}: {
  students: Student[];
  value: string[];
  onChange: (value: string[]) => void;
  disabled?: boolean;
  placeholder?: string;
}) {
  const anchor = useComboboxAnchor();
  const byId = new Map(students.map((s) => [s.studentId, s]));
  const itemLabel = (id: string) => {
    const s = byId.get(id);
    return s ? `${s.studentId} — ${fullName(s)}` : id;
  };

  return (
    <Combobox
      multiple
      autoHighlight
      disabled={disabled}
      items={students.map((s) => s.studentId)}
      value={value}
      onValueChange={onChange}
      itemToStringLabel={itemLabel}
    >
      <ComboboxChips ref={anchor}>
        <ComboboxValue>
          {(selected: string[]) => (
            <>
              {selected.map((id) => (
                <ComboboxChip key={id}>
                  {byId.get(id) ? fullName(byId.get(id)!) : id}
                </ComboboxChip>
              ))}
              <ComboboxChipsInput
                placeholder={selected.length === 0 ? placeholder : ""}
              />
            </>
          )}
        </ComboboxValue>
      </ComboboxChips>
      <ComboboxContent anchor={anchor}>
        <ComboboxEmpty>ไม่พบนักศึกษา</ComboboxEmpty>
        <ComboboxList>
          {(id: string) => (
            <ComboboxItem key={id} value={id}>
              {itemLabel(id)}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}

export default function AdminEnrollmentsPage() {
  const students = useEnrollmentStore((s) => s.students);
  const courses = useEnrollmentStore((s) => s.courses);
  const enrollStudents = useEnrollmentStore((s) => s.enrollStudents);
  const unenroll = useEnrollmentStore((s) => s.unenroll);

  const [formCourse, setFormCourse] = useState<string | null>(null);
  const [formStudents, setFormStudents] = useState<string[]>([]);
  const [enrollDialogOpen, setEnrollDialogOpen] = useState(false);
  const [mode, setMode] = useState<"course" | "student">("course");
  const [filterCourse, setFilterCourse] = useState("all");
  const [filterStudent, setFilterStudent] = useState("all");

  const studentOptions: Option[] = students.map((s) => ({
    value: s.studentId,
    label: `${s.studentId} — ${fullName(s)}`,
  }));
  const courseOptions: Option[] = courses.map((c) => ({
    value: c.courseCode,
    label: `${c.courseCode} — ${c.courseTitle}`,
  }));

  // นักศึกษาที่ยังไม่ได้ลงทะเบียนในวิชาที่เลือก
  const availableStudents = formCourse
    ? students.filter((s) => !s.enrolledCourses.includes(formCourse))
    : [];

  const handleEnroll = () => {
    if (!formCourse || formStudents.length === 0) return;
    enrollStudents(formCourse, formStudents);
    handleEnrollDialogOpenChange(false);
  };

  // เคลียร์ฟอร์มทุกครั้งที่ Dialog ปิด
  const handleEnrollDialogOpenChange = (open: boolean) => {
    setEnrollDialogOpen(open);
    if (!open) {
      setFormCourse(null);
      setFormStudents([]);
    }
  };

  // หนึ่งแถวต่อหนึ่งวิชา
  const rows = courses.filter((c) => {
    if (mode === "course") {
      return filterCourse === "all" || c.courseCode === filterCourse;
    }
    return (
      filterStudent === "all" ||
      students.some(
        (s) =>
          s.studentId === filterStudent &&
          s.enrolledCourses.includes(c.courseCode),
      )
    );
  });

  const count = formStudents.length;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">จัดการการลงทะเบียน</h1>
        <p className="text-sm text-muted-foreground">
          Admin ลงทะเบียนและยกเลิกการลงทะเบียนให้นักศึกษาได้ทุกคน
        </p>
      </div>

      <Dialog
        open={enrollDialogOpen}
        onOpenChange={handleEnrollDialogOpenChange}
      >
        <DialogTrigger render={<Button />}>
          <PlusCircle className="h-4 w-4" />
          ลงทะเบียนให้นักศึกษา
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ลงทะเบียนให้นักศึกษา</DialogTitle>
            <DialogDescription>
              เลือกวิชาก่อน แล้วเลือกนักศึกษาที่ต้องการลงทะเบียนได้หลายคน
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="formCourse">วิชา</Label>
              <OptionSelect
                id="formCourse"
                options={courseOptions}
                value={formCourse}
                placeholder="เลือกวิชา"
                onChange={(v) => {
                  setFormCourse(v);
                  setFormStudents([]); // เปลี่ยนวิชา → ล้างรายชื่อที่เลือกไว้
                }}
              />
            </div>
            <div className="grid gap-1.5">
              <Label>นักศึกษา</Label>
              <StudentCombobox
                // key เปลี่ยนตามวิชา เพื่อรีเซ็ต state ภายใน Combobox (ช่องพิมพ์ ฯลฯ)
                key={formCourse ?? "none"}
                students={availableStudents}
                value={formStudents}
                onChange={setFormStudents}
                disabled={!formCourse}
                placeholder={
                  !formCourse
                    ? "เลือกวิชาก่อน"
                    : availableStudents.length === 0
                      ? "นักศึกษาลงทะเบียนครบแล้ว"
                      : "เลือกนักศึกษา"
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button disabled={!formCourse || count === 0} onClick={handleEnroll}>
              <PlusCircle className="h-4 w-4" />
              {count > 0 ? `ลงทะเบียน (${count} คน)` : "ลงทะเบียน"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Tabs
        value={mode}
        onValueChange={(v) => setMode(v as "course" | "student")}
      >
        <TabsList>
          <TabsTrigger value="course">ค้นหาตามวิชา</TabsTrigger>
          <TabsTrigger value="student">ค้นหาตามนักศึกษา</TabsTrigger>
        </TabsList>
        <TabsContent value="course" className="pt-2">
          <OptionSelect
            id="filterCourse"
            options={[{ value: "all", label: "ทุกวิชา" }, ...courseOptions]}
            value={filterCourse}
            onChange={setFilterCourse}
          />
        </TabsContent>
        <TabsContent value="student" className="pt-2">
          <OptionSelect
            id="filterStudent"
            options={[{ value: "all", label: "ทุกคน" }, ...studentOptions]}
            value={filterStudent}
            onChange={setFilterStudent}
          />
        </TabsContent>
      </Tabs>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>รหัสวิชา</TableHead>
              <TableHead>ชื่อวิชา</TableHead>
              <TableHead>จำนวน นศ.</TableHead>
              <TableHead>นักศึกษาที่ลงทะเบียน</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="h-20 text-center text-muted-foreground"
                >
                  ไม่พบข้อมูลการลงทะเบียน
                </TableCell>
              </TableRow>
            )}
            {rows.map((c) => {
              const enrolled = students.filter((s) =>
                s.enrolledCourses.includes(c.courseCode),
              );
              return (
                <TableRow key={c.courseCode}>
                  <TableCell>{c.courseCode}</TableCell>
                  <TableCell>{c.courseTitle}</TableCell>
                  <TableCell>{enrolled.length}</TableCell>
                  <TableCell className="whitespace-normal">
                    {enrolled.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {enrolled.map((s) => (
                          <RemovableBadge
                            key={s.studentId}
                            label={fullName(s)}
                            removeLabel={`ยกเลิกการลงทะเบียนของ ${fullName(s)}`}
                            onRemove={() => unenroll(s.studentId, c.courseCode)}
                          />
                        ))}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">
                        ยังไม่มีนักศึกษา
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
