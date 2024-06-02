import React, { useEffect, useState } from 'react';
import { type Task, type User } from 'wasp/entities';
import { deleteTask, updateTask, createTask, useQuery, getAllTasksByUser } from 'wasp/client/operations';
import { useLocation } from 'react-router-dom';
import { usePapaParse } from 'react-papaparse';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { TiDelete } from 'react-icons/ti';
import { Button as NextUIButton } from '@nextui-org/react';
import { importmail } from "wasp/client/operations";
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';

export default function DemoAppPage({ user }: { user: User }) {
  const [verified, setVerified] = useState<boolean>(false);

  useEffect(() => {
    handleMailExtractClick();
    if (user.sendEmail === true) {
      setVerified(true);
    }
  }, []);

  const location = useLocation();

  const handleMailExtractClick = async () => {
    const data = user.username;
    const userId = user.id;
    console.log('this is userid', userId);
    await importmail({ data, userId });
  };

  return (
    <div className='py-10 lg:mt-10'>
      <div className='mx-auto max-w-7xl px-6 lg:px-8'>
        <div className='mx-auto max-w-4xl text-center'>
        <Typography sx={{
            marginBottom : '48px',
            fontWeight : 'bold'
          }} variant="h3" gutterBottom>
        Contact List
      </Typography>
        </div>
        <div className='w-full my-8 '>
          {verified ? (
            <div className='w-full py-10 px-6 mx-auto my-8 space-y-10'>
              <NewTaskForm handleCreateTask={createTask} />
            </div>
          ) : (
            <h1>verify your email first then reload the page</h1>
          )}
        </div>
      </div>
    </div>
  );
}

function NewTaskForm({ handleCreateTask }: { handleCreateTask: typeof createTask }) {
  const [description, setDescription] = useState<string>('');
  const [name, setName] = useState<string>('faiz');
  const [email, setEmail] = useState<string>('faizshariff540@gmail.com');
  const [subscribed, setSubscribed] = useState<boolean>(true);
  const [tag, setTag] = useState<string>('marketing');
  const [run, setRun] = useState<boolean>(false);
  const { data: tasks, isLoading: isTasksLoading } = useQuery(getAllTasksByUser);
  const { readString } = usePapaParse();

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'name', headerName: 'Name', width: 130 },
    { field: 'email', headerName: 'Email', width: 200 },
    { field: 'tag', headerName: 'Tag', width: 130 },
    { field: 'description', headerName: 'Description', width: 250 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      renderCell: (params) => (
        <NextUIButton
          onClick={() => handleDeleteClick(params.row.id)}
          className='text-red-600 hover:text-red-700'
        >
          <TiDelete size='20' />
        </NextUIButton>
      ),
    },
  ];

  const handleDeleteClick = async (id: string) => {
    await deleteTask({ id });
  };

  const handleFileUpload = async (e: any) => {
    try {
      e.preventDefault();
      const formData = new FormData(e.target as HTMLFormElement);
      const file = formData.get('file-upload') as File;
      if (!file || !file.name || !file.type) {
        throw new Error('No file selected');
      }
      const reader = new FileReader();
      reader.onload = () => {
        const fileContent = reader.result as string;
        readString(fileContent, {
          header: true,
          dynamicTyping: true,
          complete: async (results: any) => {
            for (const row of results.data) {
              const subscribeValue = /true/.test(row.Subscribed);
              const descriptionValue = row.description;
              const nameValue = row.name;
              const emailValue = row.email;
              const tagValue = row.Tag;
              try {
                await handleCreateTask({
                  description: descriptionValue,
                  name: nameValue,
                  email: emailValue,
                  Subscribed: subscribeValue,
                  Tag: tagValue,
                });
              } catch (error) {
                console.error('Error processing row:', error);
                alert('Error processing row. Please try again');
              }
            }
          },
          error: (error) => {
            console.error('Error parsing CSV:', error);
            alert('Error parsing CSV. Please try again');
          },
        });
      };
      reader.readAsText(file);
    } catch (error) {
      alert('Error uploading file. Please try again');
      console.error('Error uploading file', error);
    }
  };

  const handleSubmit = async (event: any) => {
    event.preventDefault();
    try {
      const namedata = event.target.name.value;
      const emaildata = event.target.email.value;
      const tagdata = event.target.tag.value;
      setDescription('dsfdf');
      setName(namedata);
      setEmail(emaildata);
      setSubscribed(true);
      setTag(tagdata);
      setRun(true);
    } catch (err: any) {
      window.alert('Error: ' + (err.message || 'Something went wrong'));
    }
  };

  const sortedTasks = tasks?.slice().sort((a: Task, b: Task) => {
    if (a.Tag < b.Tag) return -1;
    if (a.Tag > b.Tag) return 1;
    return 0;
  });

  const rows = sortedTasks?.map((task) => ({
    id: task.id,
    name: task.name,
    email: task.email,
    tag: task.Tag,
    description: task.description,
  }));

  return (
    <div className='flex flex-col justify-center gap-10'>
      <div className='flex flex-row gap-4 w-full justify-between' >
        <div className='space-y-48 '>
          <form onSubmit={handleFileUpload} className='border rounded-lg p-8 flex flex-col gap-2'>
            <input
              type='file'
              name='file-upload'
              accept='.pdf, .csv, text/*'
              className='text-gray-600 mb-12'
            />
            <NextUIButton
              type='submit'
              className='bg-[#000] w-full text-white cursor-pointer flex items-center gap-1 border text-lg rounded-lg' >
              Upload
            </NextUIButton>
          </form>
        </div>
        <div className='flex items-center border rounded-lg p-8 justify-between gap-3 '>
          <Box component='form' onSubmit={handleSubmit} className='flex flex-col gap-4'>
            <div className='flex flex-row gap-4'>
            <TextField
              id='tag'
              name='tag'
              label='Tag'
              variant='outlined'
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              fullWidth
            />
            <TextField
              id='name'
              name='name'
              label='Name'
              variant='outlined'
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
            />
            <TextField
              id='email'
              name='email'
              label='Email'
              variant='outlined'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
            />
            </div>
            <NextUIButton
              type='submit'
              className='bg-[#000] w-48 text-white cursor-pointer flex items-center gap-1 border text-lg rounded-lg'
            >
              Add Task
            </NextUIButton>
          </Box>
        </div>
      </div>
      <div className='space-y-10 col-span-full'>
        {isTasksLoading && <div>Loading...</div>}
        {sortedTasks && sortedTasks.length > 0 ? (
          <div className='space-y-4'>
            <DataGrid
              rows={rows}
              columns={columns}
              initialState={{
                pagination: {
                  paginationModel: { page: 0, pageSize: 5 },
                },
              }}
              pageSizeOptions={[15, 30]}
              checkboxSelection
            />
          </div>
        ) : (
          <div className='text-gray-600 text-center'>Add tasks to begin</div>
        )}
      </div>
    </div>
  );
}


/*

prints all rows at once with correct data but since all at once gives error


const delayedSetState = async ({description, name, email, Subscribed, Tag}:any) => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        console.log({ description, name, email, Subscribed, Tag })
        resolve();
      }, 5000); // Adjust the delay time as needed
    });
  };



  const handleFileUpload = async (e: any) => {
    try {
      e.preventDefault();
      const formData = new FormData(e.target as HTMLFormElement);
      const file = formData.get('file-upload') as File;
      if (!file || !file.name || !file.type) {
        throw new Error('No file selected');
      }
      const reader = new FileReader();
      reader.onload = () => {
        const fileContent = reader.result as string; 
        readString(fileContent, {
          header: true,
          dynamicTyping: true,
          complete: async (results: any) => {
            // console.log(results);
            results.data.forEach(async (row: any) => {
              const SubscribeValue = (/true/).test(row.Tag);
              const descriptionValue = row.description;
              const nameValue = row.name;
              const emailValue = row.email;
              const tagvalue = row.Subscribed;
              try {
                await delayedSetState({ description:descriptionValue,  name:nameValue, email:emailValue, Subscribed:SubscribeValue, Tag:tagvalue })
               // console.log({ description:descriptionValue,  name:nameValue, email:emailValue, Subscribed:SubscribeValue, Tag:tagvalue })
              } catch (error) {
                console.error('Error processing row:', error);
                alert('Error processing row. Please try again');
                // If you want to stop processing further rows in case of an error, you can break out of the loop here
              }
            });
          },
          error: (error) => {
            console.error('Error parsing CSV:', error);
            alert('Error parsing CSV. Please try again');
          }
        });
      };
      reader.readAsText(file); 
  
      handleSubmitfile();
    } catch (error) {
      alert('Error uploading file. Please try again');
      console.error('Error uploading file', error);
    }
  };

  


*/



/*

rows are added but data is not assigned yet

  const handleFileUpload = async (e: any) => {
    try {
      e.preventDefault();
      const formData = new FormData(e.target as HTMLFormElement);
      const file = formData.get('file-upload') as File;
      if (!file || !file.name || !file.type) {
        throw new Error('No file selected');
      }
      const reader = new FileReader();
      reader.onload = () => {
        const fileContent = reader.result as string; 
        readString(fileContent, {
          header: true,
          dynamicTyping: true,
          complete: async (results: any) => {

             console.log(results);
            results.data.forEach(async (row: any) => {
              const { description1, name1, email1, Subscribed1, Tag1 } = row;
              const SubscribeValue = (/true/).test(Tag1);
              const descriptionValue = description1;
              const nameValue = name1;
              const emailValue = email1;
              const tagvalue = Subscribed1;
              setDescription(descriptionValue)
              Setname(nameValue);
              Setemail(emailValue);
              Setsubscribed(SubscribeValue);
              Settag(tagvalue)
              try {
                await handleCreateTask({ description,  name, email, Subscribed, Tag });
              } catch (error) {
                console.error('Error processing row:', error);
                alert('Error processing row. Please try again');
                // If you want to stop processing further rows in case of an error, you can break out of the loop here
              }
            });
          },
          error: (error) => {
            console.error('Error parsing CSV:', error);
            alert('Error parsing CSV. Please try again');
          },
        });
      };
      reader.readAsText(file); 
  
      handleSubmitfile();
    } catch (error) {
      alert('Error uploading file. Please try again');
      console.error('Error uploading file', error);
    }
  };


*/



/*

onchange input working

    <div className='flex items-center justify-between gap-3'>
            <div className='border-b-2 border-gray-200 dark:border-gray-100/10'></div>
            <div className='space-y-4 col-span-full'></div>
            <input
            type='text'
            id='description'
            className='text-sm text-gray-600 w-full rounded-md border border-gray-200 bg-[#f5f0ff] shadow-md focus:outline-none focus:border-transparent focus:shadow-none duration-200 ease-in-out hover:shadow-none'
            placeholder='Enter task description'
            value={Tag}
            onChange={(e) =>  Settag(e.currentTarget.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSubmit();
              }
            }}
          />
          <input
            type='text'
            id='description'
            className='text-sm text-gray-600 w-full rounded-md border border-gray-200 bg-[#f5f0ff] shadow-md focus:outline-none focus:border-transparent focus:shadow-none duration-200 ease-in-out hover:shadow-none'
            placeholder='Enter task description'
            value={name}
            onChange={(e) => Setname(e.currentTarget.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSubmit();
              }
            }}
          />
          <input
            type='text'
            id='description'
            className='text-sm text-gray-600 w-full rounded-md border border-gray-200 bg-[#f5f0ff] shadow-md focus:outline-none focus:border-transparent focus:shadow-none duration-200 ease-in-out hover:shadow-none'
            placeholder='Enter task description'
            value={email}
            onChange={(e) => Setemail(e.currentTarget.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSubmit();
              }
            }}
          />
          ​<select  className='text-sm text-gray-600 w-full rounded-md border border-gray-200 bg-[#f5f0ff] shadow-md focus:outline-none focus:border-transparent focus:shadow-none duration-200 ease-in-out hover:shadow-none'
            onChange={(e) => Setsubscribed(e.currentTarget.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSubmit();
              }
            }}>
  <option value="True">True</option>
  <option value="False">False</option>
</select>
          <button
            type='button'
            onClick={handleSubmit}
            className='min-w-[7rem] font-medium text-gray-800/90 bg-yellow-50 shadow-md ring-1 ring-inset ring-slate-200 py-2 px-4 rounded-md hover:bg-yellow-100 duration-200 ease-in-out focus:outline-none focus:shadow-none hover:shadow-none'
          >
            Add Task
          </button>
        </div>


*/



/*

  const handleFileUpload = (event:any) => {
    event.preventDefault()
    const file = event.target.files[0];
    const formData = new FormData();
    console.log(file)

    axios.post('/upload', formData)
    .then(response => {
      console.log(response.data);
    })
    .catch(error => {
      console.error(error);
    });
  };

*/