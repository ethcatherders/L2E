import { useState } from "react";
import { useMoralis } from "react-moralis";
import Layout from "../../components/Layout";
import { 
  Container, 
  FormControl,
  FormLabel,
  Button,
  Text,
  Input,
  Heading,
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle
} from "@chakra-ui/react";
import { read } from 'xlsx';

export default function CreateCourse() {
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false)
  const [files, setFiles] = useState(undefined)
  const [inputValue, setInputValue] = useState("")
  const [courseList, setCourseList] = useState([])
  const { Moralis, user } = useMoralis();

  async function submitNewCourseFromFile(e) {
    e.preventDefault();
    // call a POST fetch request to API for parsing and appending to database
    setSuccess(false);
    setError(false);
    setSubmitting(true);
    setCourseList([])
    try {
      const fileList = files;
      console.log(fileList[0].name);
      const fileReader = new FileReader();
      fileReader.readAsBinaryString(fileList[0]);
      fileReader.onload = async (e) => {
        try {
          const workbook = read(e.target.result, {type: 'binary'});
          const sheetNames = workbook.SheetNames;
          console.log("🚀 ~ file: create.js:36 ~ fileReader.onload= ~ sheetNames:", sheetNames)
          const courses = [];
          for(let i=0; sheetNames.length > i; i++) {
            const sheet = workbook.Sheets[sheetNames[i]];
            const title = sheet.B1.v;
            const speaker = sheet.B2.v;
            const speakerTwitterUrl = (sheet.B3 && sheet.B3.v) ?? undefined;
            const videoUrl = sheet.B4.v;
            const videoDuration = parseInt(sheet.B5.v);
    
            let active = true;
            const quiz = [];
            for(let x=9; active; x++) {
              if (!sheet[`A${x}`]) break
              const id = x - 8;
              const question = sheet[`A${x}`].v;
              const options = []
              if (sheet[`B${x}`] && sheet[`B${x}`].v) {
                options.push(sheet[`B${x}`].v)
              }
              if (sheet[`C${x}`] && sheet[`C${x}`].v) {
                options.push(sheet[`C${x}`].v)
              }
              if (sheet[`D${x}`] && sheet[`D${x}`].v) {
                options.push(sheet[`D${x}`].v)
              }
              if (sheet[`E${x}`] && sheet[`E${x}`].v) {
                options.push(sheet[`E${x}`].v)
              }
              // const options = [sheet[`B${x}`].v, sheet[`C${x}`].v, sheet[`D${x}`].v, sheet[`E${x}`].v];
              const answer = sheet[`F${x}`].v;
              const quizItem = { id, question, options, answer };
              quiz.push(quizItem);
            }
            const resources = []
            for(let y=9; active; y++) {
              if (!sheet[`H${y}`]) break
              const description = sheet[`H${y}`].v
              const link = sheet[`I${y}`].v
              const resourceItem = { description, link }
              resources.push(resourceItem)
            }

            courses.push({
              title,
              videoUrl,
              videoDuration,
              speaker,
              speakerTwitterUrl,
              quiz,
              responses: [],
              resources,
              createdBy: user
            });
          }
    
          console.log("Courses:", courses);
          console.log("Uploading courses to Moralis...")
          for(let y=0; courses.length > y; y++) {
            await uploadCourse(courses[y]);
            console.log(`--> ✅ ${courses[y].title}`)
          }
          setSuccess(true);
          setCourseList(courses.map(c => c.title))
          console.log("Success!");
        } catch (error) {
          console.error(error);
          setError(true);
        }
      }
    } catch (error) {
      console.error(error);
      setError(true);
    }
    setSubmitting(false)
  }

  async function uploadCourse(courseData) {
    const Course = Moralis.Object.extend("Course");
    const course = new Course();
    await course.save(courseData);
  }

  return (
    <Layout>
      <Container paddingTop={5} paddingBottom={5}>
        <Heading mb={5}>Create a New Course</Heading>
        <form method="POST" onSubmit={submitNewCourseFromFile}>
          <FormControl>
            <FormLabel>Upload a file ending in .xlsx</FormLabel>
            <Input
              type='file'
              id="file"
              name="upload"
              accept=".xlsx"
              value={inputValue}
              onChange={e => {
                setFiles(e.currentTarget.files)
                setInputValue(e.currentTarget.value)
              }}
            />
          </FormControl>
          {error && <Text color="red">Something went wrong.</Text>}
          {success && <Alert
            status='success'
            variant='subtle'
            flexDirection='column'
            alignItems='center'
            justifyContent='center'
            textAlign='center'
            height='200px'
            borderRadius={5}
            marginTop={5}
          >
            <AlertIcon boxSize='40px' mr={0} />
            <AlertTitle mt={4} mb={1} fontSize='lg'>
              Success!
            </AlertTitle>
            <AlertDescription maxWidth='sm'>
              <Text>Successfully uploaded the following course(s):</Text>
              {(courseList.length > 0) && courseList.map((course, i) => (
                <Text key={i} textAlign="left">✅ {course}</Text>
              ))}
            </AlertDescription>
          </Alert>}
          <Button
            type="submit"
            marginTop={5}
            isLoading={submitting}
            loadingText='Processing...'
            color='white'
            backgroundColor='black'
            isDisabled={success}
          >
            Submit
          </Button>
          {success && (
            <Button
              type="button"
              marginTop={5}
              marginLeft={2}
              isLoading={submitting}
              loadingText='Processing...'
              color='white'
              backgroundColor='black'
              onClick={() => {
                setInputValue("")
                setFiles(undefined)
                setSuccess(false)
              }}
            >
              Reset
            </Button>
          )}
        </form>
      </Container>
    </Layout>
  )
}