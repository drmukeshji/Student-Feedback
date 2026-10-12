import { DEPARTMENTS, FACULTIES, type Role } from "./roles";

export type Option = { value: string; label: string };

export type Field =
  | {
      type: "text" | "email" | "tel" | "number" | "date" | "textarea";
      id: string;
      label: string;
      required?: boolean;
      /** Pre-fill from the logged-in user's profile. */
      prefill?: "name" | "email" | "phone" | "department" | "program" | "designation" | "organization" | "wardName" | "graduationYear";
      placeholder?: string;
    }
  | { type: "select" | "radio"; id: string; label: string; options: Option[]; required?: boolean; prefill?: "department" | "program" }
  | { type: "checkboxes"; id: string; label: string; options: Option[] }
  | {
      /** A table of statements, each answered on the same scale. Answers are stored as `${id}.${item.id}`. */
      type: "matrix";
      id: string;
      label?: string;
      scale: Option[];
      /** When true, option values are numbers and the report shows an average score. */
      numeric?: boolean;
      items: { id: string; label: string }[];
      required?: boolean;
    };

export type Section = { title: string; description?: string; fields: Field[] };

export type FormDef = {
  id: string;
  title: string;
  shortTitle: string;
  intro: string;
  roles: Role[];
  /** Allow the same user to submit more than once (e.g. once per semester). */
  repeatable?: boolean;
  sections: Section[];
};

const opts = (...labels: string[]): Option[] => labels.map((l) => ({ value: l, label: l }));
const items = (prefix: string, labels: string[]) => labels.map((label, i) => ({ id: `${prefix}${i + 1}`, label }));

const SCALE_POOR_EXCELLENT: Option[] = [
  { value: "1", label: "Poor" },
  { value: "2", label: "Satisfactory" },
  { value: "3", label: "Moderate" },
  { value: "4", label: "Good" },
  { value: "5", label: "Excellent" },
];
const SCALE_AGREE: Option[] = [
  { value: "1", label: "Strongly Disagree" },
  { value: "2", label: "Disagree" },
  { value: "3", label: "Neutral" },
  { value: "4", label: "Agree" },
  { value: "5", label: "Strongly Agree" },
];
const SCALE_STUDENT: Option[] = [
  { value: "1", label: "Below Average" },
  { value: "2", label: "Average" },
  { value: "3", label: "Good" },
  { value: "4", label: "Very Good" },
  { value: "5", label: "Excellent" },
];
const SCALE_ALUMNI: Option[] = [
  { value: "1", label: "Poor" },
  { value: "2", label: "Average" },
  { value: "3", label: "Good" },
  { value: "4", label: "Very Good" },
  { value: "5", label: "Excellent" },
];
const SCALE_EMPLOYER: Option[] = [
  { value: "1", label: "Poor" },
  { value: "2", label: "Fair" },
  { value: "3", label: "Good" },
  { value: "4", label: "V. Good" },
  { value: "5", label: "Excellent" },
];
const YES_NO = opts("Yes", "No");
const EXTENT = opts("Very Little", "Some Extent", "Quite A Bit", "Very Much");
const ADEQUACY = opts("Adequate", "Not adequate", "Needs Improvement");
const DEPT_OPTIONS = opts(...DEPARTMENTS);

const suggestions = (id: string, label = "Suggestions for further improvement"): Field => ({ type: "textarea", id, label });
const place: Field = { type: "text", id: "place", label: "Place" };

export const FORMS: FormDef[] = [
  {
    id: "student-feedback",
    title: "Students Feedback Form",
    shortTitle: "Student Feedback",
    intro:
      "The Internal Quality Assurance Cell of the Gurugram University is conducting a Students’ Experience Survey for undergraduate/postgraduate students of the University based on their experiences in the University. This feedback will help the University assess its services for students and areas that need to be improved to enhance the quality of student experience. A higher score indicates a better experience.",
    roles: ["STUDENT"],
    repeatable: true,
    sections: [
      {
        title: "General Questions",
        fields: [
          { type: "radio", id: "programme", label: "Programme of study", options: opts("UG", "PG"), required: true, prefill: "program" },
          { type: "radio", id: "faculty", label: "Faculty of your study", options: opts(...FACULTIES.map((f) => f.name)), required: true },
          { type: "select", id: "department", label: "Department", options: DEPT_OPTIONS, required: true, prefill: "department" },
          { type: "radio", id: "semester", label: "Semester of study", options: opts("I", "II", "III", "IV", "V", "VI", "Beyond VI"), required: true },
          { type: "radio", id: "residence", label: "Residence", options: opts("Hostel", "PG/Rented", "Local", "NCR", "Other"), required: true },
          { type: "radio", id: "gender", label: "Gender", options: opts("Male", "Female", "Other"), required: true },
          { type: "radio", id: "category", label: "Category", options: opts("General", "OBC", "SC", "ST", "PwD", "Other"), required: true },
          { type: "radio", id: "attendance", label: "Attendance (regularity in class)", options: opts("≥ 75%", "> 50% and < 75%", "< 50%"), required: true },
          { type: "radio", id: "classStrength", label: "Class strength", options: opts("< 40", "40-80", "> 80"), required: true },
        ],
      },
      {
        title: "A. Academic",
        fields: [
          {
            type: "matrix",
            id: "academic",
            scale: SCALE_STUDENT,
            numeric: true,
            required: true,
            items: items("a", [
              "Content of syllabi of the courses",
              "Extent of syllabi covered in the class",
              "Delivery of syllabi in the class",
              "Use of teaching aids and ICT in the class to facilitate teaching",
              "Overall experience with internal assessment (quiz, assignments, presentations etc.)",
              "Student–teacher interaction",
              "Integration of theory and practical in classes (wherever applicable)",
              "Stimulation for innovative thinking",
              "Overall learning experience",
              "Condition of lab equipment",
              "Availability of online resources",
              "Opportunities in the Department/University for research activities",
              "Opportunity to participate in seminar/workshop/conference/research projects",
              "Experience with research environment",
              "Participation in co-academic and cultural events",
            ]),
          },
        ],
      },
      {
        title: "B. Infrastructure",
        fields: [
          {
            type: "matrix",
            id: "infrastructure",
            scale: SCALE_STUDENT,
            numeric: true,
            required: true,
            items: items("b", [
              "Classroom facilities (LCD/audio/computer/seating arrangement etc.)",
              "Library reading room facility",
              "Library digital resources and reading material support",
              "Internet facility",
              "University website",
              "Department website",
              "Sports facility",
              "Food outlets/canteens",
              "Drinking water facility",
              "Washroom facilities",
              "Hostel facility",
              "Transport facility",
              "Safety measures",
            ]),
          },
        ],
      },
      {
        title: "C. Support System",
        fields: [
          {
            type: "matrix",
            id: "support",
            scale: SCALE_STUDENT,
            numeric: true,
            required: true,
            items: items("c", [
              "Experience of the admission process to the programme you have enrolled",
              "Help received by orientation/induction programme of the Dept./Institution",
              "Experience with University/Departmental support staff",
              "Timely announcement of result",
              "Experience with timely availability of mark sheet",
              "Experience with evaluation process",
              "Experience with placement cell of the department",
              "Functioning of placement cell of the department",
              "Experience with competitive examination cell of the University",
              "Experience with counselling cell of the University",
              "Experience with innovation cell of the University",
              "Experience with healthcare facility",
            ]),
          },
        ],
      },
      {
        title: "D. Skills / Competencies Developed During Course of Study",
        fields: [
          {
            type: "matrix",
            id: "skills",
            scale: SCALE_STUDENT,
            numeric: true,
            required: true,
            items: items("d", [
              "Analytical competency",
              "Problem solving competence",
              "Leadership and team work",
              "Time management",
              "Collaboration skills",
              "Communication competence",
              "IT skills",
              "Critical thinking",
              "Entrepreneurial / job skills",
            ]),
          },
        ],
      },
      {
        title: "E. Overall University Experience",
        fields: [
          {
            type: "matrix",
            id: "overall",
            scale: SCALE_STUDENT,
            numeric: true,
            required: true,
            items: items("e", ["Your overall academic experience", "Would you recommend this University to others"]),
          },
          suggestions("suggestions", "Suggestions, if any"),
        ],
      },
    ],
  },
  {
    id: "exit-survey",
    title: "Exit Survey Report by the Student",
    shortTitle: "Exit Survey",
    intro: "To be filled by students on completion of their programme. Please give a rating of your course on the following (1 = Poor, 5 = Excellent).",
    roles: ["STUDENT", "ALUMNI"],
    sections: [
      {
        title: "Student Details",
        fields: [
          { type: "text", id: "name", label: "Name of student", required: true, prefill: "name" },
          { type: "text", id: "course", label: "Course", required: true, prefill: "program" },
          { type: "select", id: "department", label: "Department", options: DEPT_OPTIONS, required: true, prefill: "department" },
          { type: "number", id: "sessionFrom", label: "Session from (year)", required: true },
          { type: "number", id: "sessionTo", label: "Session to (year)", required: true, prefill: "graduationYear" },
        ],
      },
      {
        title: "Curriculum Design",
        fields: [
          {
            type: "matrix",
            id: "curriculum",
            scale: SCALE_POOR_EXCELLENT,
            numeric: true,
            required: true,
            items: items("c", [
              "Course organization",
              "Academic/course contents",
              "Depth of the courses covered",
              "Learning values (in terms of skills, concepts, knowledge, analytical abilities, or broadening perspectives)",
              "Applicability/relevance to real life situations / academic contents",
            ]),
          },
        ],
      },
      {
        title: "Teaching and Other Staff",
        fields: [
          {
            type: "matrix",
            id: "staff",
            scale: SCALE_POOR_EXCELLENT,
            numeric: true,
            required: true,
            items: items("t", [
              "Faculty/teachers",
              "Head of the Department or Chairperson",
              "Non-teaching staff in the Chairperson office",
              "Lab staff in the department",
            ]),
          },
        ],
      },
      {
        title: "Infrastructure and Learning Resources",
        fields: [
          {
            type: "matrix",
            id: "infra",
            scale: SCALE_POOR_EXCELLENT,
            numeric: true,
            required: true,
            items: items("i", [
              "Library facilities",
              "Computer facilities",
              "Hostel facilities",
              "Lab facilities",
              "Research facilities",
              "Extra-curricular activities",
              "Sports facilities",
              "Health care facilities",
              "Recreational facilities",
              "Extension activities",
              "Training and placement opportunities",
            ]),
          },
        ],
      },
      {
        title: "Governance",
        fields: [
          {
            type: "matrix",
            id: "governance",
            scale: SCALE_POOR_EXCELLENT,
            numeric: true,
            required: true,
            items: items("g", ["Students counseling / grievance handling", "Students involvement in decision making"]),
          },
          suggestions("suggestions"),
          place,
        ],
      },
    ],
  },
  {
    id: "alumni-feedback",
    title: "Alumni Feedback Form",
    shortTitle: "Alumni Feedback",
    intro:
      "Dear Alumni of Gurugram University, greetings! We are glad that you have spent your valuable years in pursuing your higher education in this university. We shall be thankful if you can spare some of your valuable time to fill up this alumni feedback form and give us your valuable suggestions for further improvement of the University. Your inputs will be of great use to improve the quality of our academic programs and enhance the credibility at national level.",
    roles: ["ALUMNI"],
    sections: [
      {
        title: "Alumni Details",
        fields: [
          { type: "text", id: "name", label: "Name", required: true, prefill: "name" },
          { type: "number", id: "yearOfPassing", label: "Year of passing", required: true, prefill: "graduationYear" },
          { type: "text", id: "degree", label: "UG/PG degree", required: true, prefill: "program" },
          { type: "select", id: "department", label: "Department", options: DEPT_OPTIONS, prefill: "department" },
          { type: "text", id: "employment", label: "Current employment details", prefill: "organization" },
          { type: "tel", id: "contact", label: "Contact details (mobile)", prefill: "phone" },
          { type: "email", id: "email", label: "Email id", required: true, prefill: "email" },
        ],
      },
      {
        title: "I. Rate the following attributes",
        fields: [
          {
            type: "matrix",
            id: "attributes",
            scale: SCALE_ALUMNI,
            numeric: true,
            required: true,
            items: items("r", [
              "Admission Cell",
              "Alumni network of friends",
              "University ambience",
              "Environment",
              "Faculty",
              "Hostel facilities",
              "Canteen facilities",
              "How do you rate the courses which are skills oriented",
              "How do you rate the courses that you have studied for UG/PG",
              "How do you rate the learning experience in terms of teaching and learning",
              "Infrastructure & lab facilities",
              "Content learnt in relation to your current job",
              "Library resources",
              "Overall rating of the University",
              "Overall rating of academic programs",
              "Industry visits",
              "Industrial gaps, if any",
              "Training, internship & placement",
              "Project guidance",
              "Overall capability of students passing out of this University",
              "Quality of support material",
            ]),
          },
        ],
      },
      {
        title: "II. Feedback about University",
        fields: [
          { type: "radio", id: "q1", label: "1. Are you associated with University Alumni Association?", options: YES_NO, required: true },
          { type: "radio", id: "q2", label: "2. Do you feel proud to be associated with our university as an Alumni?", options: YES_NO, required: true },
          {
            type: "radio",
            id: "q3",
            label: "3. How do you rate development activities organized by the Department for your overall development?",
            options: EXTENT,
            required: true,
          },
          {
            type: "radio",
            id: "q4",
            label: "4. Are you willing to participate in the alumni activities for the development of the university?",
            options: YES_NO,
            required: true,
          },
          {
            type: "matrix",
            id: "q5",
            label: "5. Rate the adequacy of following as they were during your tenure as a student at our campus",
            scale: ADEQUACY,
            required: true,
            items: items("f", [
              "Laboratories & equipments",
              "Library / seminar / reading room",
              "Computer facilities",
              "Internet & Wi-Fi",
              "Sports and cultural facilities",
              "NSS",
              "NCC",
              "University Red Cross",
              "Classrooms",
            ]),
          },
        ],
      },
      {
        title: "III. Feedback about Department & Faculty",
        fields: [
          { type: "radio", id: "q6", label: "6. Have you obtained sufficient know-how (both in theory and practice) at dept?", options: YES_NO, required: true },
          { type: "radio", id: "q7", label: "7. Is the education imparted relevant and useful in your present job?", options: YES_NO, required: true },
          { type: "radio", id: "q8", label: "8. Were the administrators & teachers cooperative?", options: YES_NO, required: true },
          {
            type: "matrix",
            id: "q9",
            label: "9. Rate the following academic initiatives taken by the University to improve know-how of the students",
            scale: EXTENT,
            required: true,
            items: items("k", [
              "Industry oriented projects",
              "Seminars & workshop",
              "Guest lectures",
              "Special training classes for bridging industry/academic gap",
            ]),
          },
        ],
      },
      {
        title: "IV. Abilities / Skills Acquired",
        fields: [
          {
            type: "checkboxes",
            id: "abilities",
            label: "Which of the following abilities/skills you acquired during the completion of your programme?",
            options: opts(
              "To express",
              "To solve problems",
              "To learn technology",
              "To apply technology to solve problems",
              "To serve the community",
              "To work in a team",
            ),
          },
        ],
      },
      {
        title: "V. Please comment on the following",
        fields: [
          { type: "textarea", id: "c10", label: "10. Relevance of curriculum in your job" },
          { type: "textarea", id: "c11", label: "11. Need any change in curriculum and syllabi" },
          { type: "textarea", id: "c12", label: "12. Improvements in teaching and learning process" },
          { type: "textarea", id: "c13", label: "13. Your vision for the University" },
          {
            type: "textarea",
            id: "c14",
            label:
              "14. How can you contribute in the development of your department, in particular, and institution as a whole like IDPs, workshops, placements, seminars, etc.",
          },
          { type: "textarea", id: "c15", label: "15. Any other suggestions/comments" },
        ],
      },
    ],
  },
  {
    id: "faculty-feedback",
    title: "Feedback from Faculty Members",
    shortTitle: "Faculty Feedback",
    intro:
      "Your opinions and suggestions are solicited for further improvement of the University system. Your responses will be kept confidential and used only for the stated purpose. Against each statement a five-point scale is given: Strongly Agree (5), Agree (4), Neutral (3), Disagree (2) and Strongly Disagree (1).",
    roles: ["FACULTY"],
    sections: [
      {
        title: "Faculty Details",
        fields: [
          { type: "text", id: "name", label: "Name of the faculty", required: true, prefill: "name" },
          { type: "text", id: "designation", label: "Designation", required: true, prefill: "designation" },
          { type: "select", id: "department", label: "Department", options: DEPT_OPTIONS, required: true, prefill: "department" },
          { type: "date", id: "dateOfJoining", label: "Date of joining" },
        ],
      },
      {
        title: "Curriculum Design and Development",
        fields: [
          {
            type: "matrix",
            id: "curriculum",
            scale: SCALE_AGREE,
            numeric: true,
            required: true,
            items: items("c", [
              "Board of studies is taking care to ensure the concurrency and relevance of the program offering",
              "The curriculum has been updated as and when required",
              "Representation from industry is helpful in designing and improving the courses",
              "The system followed by the University for the design and development of curriculum is effective",
              "Freedom to contribute my ideas on curriculum design and development is available",
              "Employability is considered in curriculum design and development",
            ]),
          },
          suggestions("curriculumSuggestions", "Suggestions for improvement in curriculum design and development"),
        ],
      },
      {
        title: "Teaching, Learning, Evaluation & Research",
        fields: [
          {
            type: "matrix",
            id: "teaching",
            scale: SCALE_AGREE,
            numeric: true,
            required: true,
            items: items("t", [
              "The admission process adopted by the University is effective",
              "The University is able to attract meritorious students",
              "Student centered learning resources are available in the University",
              "The faculty are updating their knowledge and skills",
              "Academic calendar is followed",
              "The library is managed and utilized effectively",
              "Library timings are convenient",
              "Adequate learning resources are provided",
              "Encouragement to organize seminars/workshops/symposia/conferences",
              "Encouragement to participate in seminars/workshops/symposia/conferences",
              "The teachers are encouraged to undertake extension service programs",
              "The teachers are encouraged to establish linkage with industry",
              "The teachers are encouraged to take-up consultancy services",
              "The examination system followed by the University is effective",
              "The teachers are encouraged to carry out research",
              "The merit of the teachers is recognized",
            ]),
          },
          suggestions("teachingSuggestions", "Suggestions for improvement in teaching, learning, evaluation and research"),
        ],
      },
      {
        title: "Infrastructure",
        fields: [
          {
            type: "matrix",
            id: "infrastructure",
            scale: SCALE_AGREE,
            numeric: true,
            required: true,
            items: items("i", [
              "Adequate class rooms and furniture available",
              "The labs are adequately equipped",
              "Sufficient toilets available for faculty and students",
              "The buildings and furniture are well maintained",
              "Optimal utilization of infrastructure available in the department",
              "Adequate parking facilities",
              "Roads are well maintained",
              "Adequate water resources are provided",
              "Adequate sports infrastructure",
            ]),
          },
          suggestions("infrastructureSuggestions", "Suggestions for improvement in infrastructure"),
        ],
      },
      {
        title: "Governance",
        fields: [
          {
            type: "matrix",
            id: "governance",
            scale: SCALE_AGREE,
            numeric: true,
            required: true,
            items: items("g", [
              "Sincere efforts are being done by the administration for the development of the University",
              "The administration is accessible",
              "The quality initiatives taken up during the last academic year are contributing for improvement",
              "The MoUs entered by the university enhance the scope for mutual cooperation with institutions and research organizations of repute",
              "The faculty is given freedom to express their opinions",
              "The IQAC is working well for promoting quality in the institution",
              "The University is providing adequate opportunities and support to the faculty",
            ]),
          },
          suggestions("governanceSuggestions", "Suggestions for improvement in governance"),
          place,
        ],
      },
    ],
  },
  {
    id: "employer-feedback",
    title: "Feedback from Employers",
    shortTitle: "Employer Feedback",
    intro:
      "Thank you for sparing time to fill out this questionnaire. All the information will be kept confidential and will be used only for statistical purposes. The survey is intended to assist GUG in preparing students for the work environment and to better serve your company and industry needs.",
    roles: ["EMPLOYER"],
    repeatable: true,
    sections: [
      {
        title: "Company Details",
        fields: [
          { type: "text", id: "company", label: "Company name", required: true, prefill: "organization" },
          { type: "text", id: "person", label: "Person filling the form", required: true, prefill: "name" },
          { type: "text", id: "designation", label: "Designation", required: true, prefill: "designation" },
          { type: "email", id: "email", label: "Email id", required: true, prefill: "email" },
          { type: "tel", id: "mobile", label: "Mobile no.", prefill: "phone" },
          { type: "textarea", id: "address", label: "Address of company" },
        ],
      },
      {
        title: "Employee (Graduate) Details",
        description: "Submit one form per graduate employee.",
        fields: [
          { type: "text", id: "employeeName", label: "Name of the employee", required: true },
          { type: "text", id: "position", label: "Position held by the employee", required: true },
          { type: "date", id: "dateOfHire", label: "Date of hire" },
          { type: "radio", id: "stillEmployed", label: "Is the graduate still employed by your company?", options: YES_NO, required: true },
        ],
      },
      {
        title: "Level of Satisfaction with Employee's Performance",
        fields: [
          {
            type: "matrix",
            id: "performance",
            scale: SCALE_EMPLOYER,
            numeric: true,
            required: true,
            items: items("p", [
              "Overall job performance",
              "Job specific skills",
              "Problem solving skills",
              "Individual and teamwork skills",
              "Leadership skills",
              "Level of professionalism and ethical behaviour",
            ]),
          },
          { type: "radio", id: "hireAgain", label: "Would you consider having graduates/P.G. in the future?", options: YES_NO, required: true },
          suggestions(
            "suggestions",
            "Based on your experience, how can GUG improve the graduate’s / post graduate’s skills to meet your company’s needs?",
          ),
          place,
        ],
      },
    ],
  },
  {
    id: "parent-feedback",
    title: "Feedback from the Parents",
    shortTitle: "Parent Feedback",
    intro: "Please give a rating based on your experience (1 = Poor, 5 = Excellent).",
    roles: ["PARENT"],
    repeatable: true,
    sections: [
      {
        title: "Parent & Ward Details",
        fields: [
          { type: "text", id: "name", label: "Name (Mr./Ms./Mrs.)", required: true, prefill: "name" },
          { type: "number", id: "age", label: "Age (years)" },
          { type: "radio", id: "sex", label: "Sex", options: opts("M", "F") },
          { type: "text", id: "education", label: "Education" },
          { type: "text", id: "occupation", label: "Occupation", prefill: "organization" },
          { type: "tel", id: "mobile", label: "Mobile number", prefill: "phone" },
          { type: "email", id: "email", label: "Email", prefill: "email" },
          { type: "text", id: "studentName", label: "Student name", required: true, prefill: "wardName" },
          { type: "text", id: "deptCourse", label: "Dept./Course", required: true, prefill: "department" },
          { type: "text", id: "duration", label: "Duration of study", placeholder: "e.g. 2023–2027" },
        ],
      },
      {
        title: "Rating",
        fields: [
          {
            type: "matrix",
            id: "rating",
            scale: SCALE_POOR_EXCELLENT,
            numeric: true,
            required: true,
            items: items("p", [
              "The admission process in the University is fair and accurate",
              "Annual fee structure",
              "General discipline of students",
              "Academic environment and lab facilities",
              "Teacher’s competency",
              "Knowledge in terms of relevance to latest technologies",
              "Outcome achieved by your ward",
              "Accessibility of University information system",
              "Curriculum is well designed to promote learning experience of student",
              "Transparency in internal evaluation",
              "Timely declaration of results",
              "Website of the University is informative and regularly updated",
              "Interaction/counseling of students by teacher",
              "Counseling and guidance facilities",
              "Extracurricular activities",
              "Library facilities",
              "Computer and internet facilities",
              "Hostel facilities",
              "Sports facilities",
              "Health care facilities",
              "Recreational facilities",
              "Anti-ragging / anti eve teasing steps taken by the University",
            ]),
          },
          suggestions("suggestions"),
          place,
        ],
      },
    ],
  },
  {
    id: "staff-feedback",
    title: "Feedback from Support-Staff Members",
    shortTitle: "Support Staff Feedback",
    intro:
      "Against each statement a five-point scale is given: Strongly Agree (5), Agree (4), Neutral (3), Disagree (2) and Strongly Disagree (1).",
    roles: ["STAFF"],
    sections: [
      {
        title: "Staff Details",
        fields: [
          { type: "text", id: "name", label: "Name (Dr./Mr./Ms./Mrs.)", required: true, prefill: "name" },
          { type: "text", id: "designation", label: "Designation", required: true, prefill: "designation" },
          { type: "text", id: "section", label: "Section / Department", required: true, prefill: "department" },
          { type: "number", id: "experience", label: "Experience (years)" },
        ],
      },
      {
        title: "Statements",
        fields: [
          {
            type: "matrix",
            id: "statements",
            scale: SCALE_AGREE,
            numeric: true,
            required: true,
            items: items("s", [
              "The procedures followed in the University are transparent and effective",
              "The work distribution is fair",
              "The work load is reasonable",
              "The placement of the employees is as per the job requirements",
              "The training programs organized by the University are helpful",
              "The promotion policies of the University are encouraging",
              "The infrastructure facilities are supporting the work environment",
              "The superior-subordinate relationships are fine",
              "The administration respects women employees and treats them well",
              "The employees have the opportunity to contribute for process development",
              "The employee grievances are settled fairly",
              "The University provides opportunities and support to the staff and their family members",
              "Administration attempts to provide better work-environment",
              "Administration invite innovative suggestions from staff",
            ]),
          },
          suggestions("suggestions"),
          place,
        ],
      },
    ],
  },
];

export function getForm(id: string): FormDef | undefined {
  return FORMS.find((f) => f.id === id);
}

export function formsForRole(role: Role): FormDef[] {
  return role === "ADMIN" ? FORMS : FORMS.filter((f) => f.roles.includes(role));
}

export function allFields(form: FormDef): Field[] {
  return form.sections.flatMap((s) => s.fields);
}

/** Flat list of answer keys + human labels, in form order (used for CSV + response view). */
export function answerColumns(form: FormDef): { key: string; label: string; field: Field }[] {
  const cols: { key: string; label: string; field: Field }[] = [];
  for (const f of allFields(form)) {
    if (f.type === "matrix") {
      for (const it of f.items) cols.push({ key: `${f.id}.${it.id}`, label: it.label, field: f });
    } else {
      cols.push({ key: f.id, label: f.label, field: f });
    }
  }
  return cols;
}

export type Answers = Record<string, string | string[]>;

/** Validate and normalise submitted FormData against the definition. */
export function parseAnswers(form: FormDef, data: FormData): { answers: Answers; errors: string[] } {
  const answers: Answers = {};
  const errors: string[] = [];
  for (const f of allFields(form)) {
    if (f.type === "matrix") {
      const allowed = new Set(f.scale.map((o) => o.value));
      for (const it of f.items) {
        const key = `${f.id}.${it.id}`;
        const v = String(data.get(key) ?? "");
        if (v && allowed.has(v)) answers[key] = v;
        else if (f.required) errors.push(`Please rate: ${it.label}`);
      }
    } else if (f.type === "checkboxes") {
      const allowed = new Set(f.options.map((o) => o.value));
      answers[f.id] = data.getAll(f.id).map(String).filter((v) => allowed.has(v));
    } else {
      const v = String(data.get(f.id) ?? "").trim().slice(0, 5000);
      if ((f.type === "select" || f.type === "radio") && v && !f.options.some((o) => o.value === v)) {
        errors.push(`Invalid choice for: ${f.label}`);
        continue;
      }
      if (v) answers[f.id] = v;
      else if (f.required) errors.push(`Required: ${f.label}`);
    }
  }
  return { answers, errors };
}

export function displayAnswer(field: Field, value: string | string[] | undefined): string {
  if (value === undefined || value === "") return "";
  if (Array.isArray(value)) return value.join("; ");
  if (field.type === "matrix") {
    const opt = field.scale.find((o) => o.value === value);
    return field.numeric && opt ? `${value} – ${opt.label}` : opt?.label ?? value;
  }
  return value;
}
