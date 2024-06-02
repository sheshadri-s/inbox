import React, { useEffect, useRef, useState } from "react";
import { DefaultJsonData } from "../mails/default";
import { TemplateJsonData } from "../mails/template";
import EmailEditor, { EditorRef } from 'react-email-editor';
import { Button } from "@nextui-org/react";
import { useQuery, getAllTasksByUser } from 'wasp/client/operations';
import { useLocation } from 'react-router-dom';
import { createCampaign } from "wasp/client/operations";

export default function Write(props: any) {
  const [loading, setLoading] = useState(true);
  const [jsonData, setJsonData] = useState<any>(DefaultJsonData);
  const [tempData, setTempData] = useState<any>(TemplateJsonData);
  const [emaildata, setEmailData] = useState<any>(null);
  const emailEditorRef = useRef<EditorRef | any>(null);
  const { data: tasks, isLoading: isTasksLoading } = useQuery(getAllTasksByUser);
  const location = useLocation();

  // Parse the query parameters from the URL
  const searchParams = new URLSearchParams(location.search);
  const key1 : any = searchParams.get('list');
  const key2 = searchParams.get('template');
  const key3 = searchParams.get('schedule');

  useEffect(() => {
    if (!isTasksLoading && tasks) {
      setLoading(false);
    }
    if (key2 === 'new') {
      setEmailData(jsonData);
    } else {
      setEmailData(tempData);
    }
  }, [tasks, isTasksLoading, key2, jsonData, tempData]); 

  // Generate dynamic merge tags based on the properties of the first task
  const dynamicMergeTags = tasks && key1 && tasks?.length ? Object.keys(tasks[0]).reduce((acc: any, key) => {
    acc[key] = {
      name: key.charAt(0).toUpperCase() + key.slice(1), // Capitalize the key
      value: `{{${key}}}`,
    };
    return acc;
  }, {}) : {};

  const exportHtml = () => {
    emailEditorRef.current?.editor.exportHtml((data: any) => {
      const { design, html } = data;
      console.log('exportHtml', html);
    });
  };

  

  const onLoad = () => {
    if (emailEditorRef.current) {
      emailEditorRef.current.editor.loadDesign(emaildata);
      emailEditorRef.current.editor.addEventListener('design:loaded', () => {
        emailEditorRef.current.editor.setMergeTags(dynamicMergeTags);
      });
    }
  };

  const onReady = () => {
    console.log('onReady');
    if (emailEditorRef.current) {
      emailEditorRef.current.editor.setMergeTags(dynamicMergeTags);
    }
  };

  return (
    <div className="w-full h-full">
      {!loading && (
        <>
          <div className="w-screen">
            <div className="absolute ml-20 justify-center">
              <EmailEditor
                ref={emailEditorRef}
                minHeight={"90vh"}
                onLoad={onLoad}
                onReady={onReady}
              />
            </div>
          </div>
          <div className="absolute bottom-0 flex items-center justify-end gap-4 right-0 w-full border-t p-3">
            <Button
              className="bg-transparent cursor-pointer flex items-center gap-1 text-black border border-[#00000048] text-lg rounded-lg"
            >
              <span className="opacity-[.7]">Cancel</span>
            </Button>
            <Button
              className="bg-[#000] text-white cursor-pointer flex items-center gap-1 border text-lg rounded-lg"
              onClick={exportHtml}
            >
              <span>Send</span>
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

