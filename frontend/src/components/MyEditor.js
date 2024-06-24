import React, { useState, useRef, useCallback, useMemo} from 'react';
import ReactQuill, {Quill} from 'react-quill';
import EditorToolBar from "./EditorToolBar";
import ThreeModelButton from "./ThreeModelButton";
import ImageResize from 'quill-image-resize';
import { ImageDrop } from "quill-image-drop-module";
import axios from "axios";
import katex from 'katex';
import QuillImageDropAndPaste from 'quill-image-drop-and-paste'
import DragDrop from './DragDrop'

import htmlEditButton from "quill-html-edit-button";

import 'katex/dist/katex.min.css'; // formular 활성화
import 'react-quill/dist/quill.snow.css'; // Quill snow스타일 시트 불러오기

// npm install react-quill quill-image-resize quill-image-drop-module react-bootstrap bootstrap three @react-three/drei @react-three/fiber katex express axios multer quill-html-edit-button react-router-dom cors --save
 
// 설치해야 할 모듈
// npm install react-quill
// npm install react-quill --legacy-peer-deps
// npm install quill-image-resize
// npm install quill-image-drop-module
// npm install react-bootstrap bootstrap
// npm install three
// npm install @react-three/drei
// npm install @react-three/fiber
// npm install katex
// npm install express
// npm install axios

// 24.05.04 추가한 모듈
// npm install multer
// npm install quill-html-edit-button

// 24.05.17 추가한 모듈
// npm install react-router-dom
// npm install cors --save
// npm install quill-image-drop-and-paste --save

// 24.06.22 추가한 모듈
// npm i cors

// katex 추가
window.katex = katex;
// 모듈 등록
Quill.register("modules/imageDrop", ImageDrop);
Quill.register('modules/imageDropAndPaste', QuillImageDropAndPaste);
Quill.register('modules/ImageResize', ImageResize);

// 폰트 사이즈 추가
const Size = Quill.import("attributors/style/size");
Size.whitelist = ["8px", "10px", "12px", 
"14px", "20px", "24px", "30px", "36px", "48px",
"60px", "72px", "84px", "96px", "120px"];
Quill.register(Size, true);

// 폰트 추가
const Font = Quill.import("attributors/class/font");
Font.whitelist = ["arial", "buri", "gangwon", "Quill", "serif", "monospace", "끄트머리체", "할아버지의나눔", "나눔고딕", "궁서체", "굴림체", "바탕체", "돋움체"];
Quill.register(Font, true);

// align & icon 변경
const Align = ReactQuill.Quill.import("formats/align");
Align.whitelist = ["left", "center", "right", "justify"];
const Icons = ReactQuill.Quill.import("ui/icons");
Icons.align["left"] = Icons.align[""];

// htmlEditButton 적용
Quill.register({
  "modules/htmlEditButton":htmlEditButton
});

const MyEditor = () => {
  const [editorHtml, setEditorHtml] = useState('');
  const quillRef = useRef();

  const handleChange = useCallback((html) => {
    setEditorHtml(html);
  }, []);
  
  // 이미지 처리를 하는 핸들러
  const imageHandler = () => {
    console.log('에디터에서 이미지 버튼을 클릭하면 이미지 핸들러가 시작됩니다!');

    // 1. 이미지를 저장할 input type=file DOM을 만든다.
    const input = document.createElement('input');
    // 속성 써주기
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*'); // 원래 image/*
    input.click(); // 에디터 이미지버튼을 클릭하면 이 input이 클릭된다.
    // input이 클릭되면 파일 선택창이 나타난다.

    // input에 변화가 생긴다면 = 이미지를 선택
    input.addEventListener('change', async () => {
      console.log('온체인지');
      const file = input.files[0];
      // multer에 맞는 형식으로 데이터 만들어준다.
      const formData = new FormData();
      formData.append('img', file); // formData는 키-밸류 구조
      // 백엔드 multer라우터에 이미지를 보낸다.
      try {
        const result = await axios.post('http://localhost:3001/img', formData);
        
        console.log('성공 시, 백엔드가 보내주는 데이터', result.data.url);
        const IMG_URL = result.data.url;
        // 이 URL을 img 태그의 src에 넣은 요소를 현재 에디터의 커서에 넣어주면 에디터 내에서 이미지가 나타난다
        // src가 base64가 아닌 짧은 URL이기 때문에 데이터베이스에 에디터의 전체 글 내용을 저장할 수있게된다
        // 이미지는 꼭 로컬 백엔드 uploads 폴더가 아닌 다른 곳에 저장해 URL로 사용하면된다.

        // 이미지 태그를 에디터에 써주기 - 여러 방법이 있다.
        const editor = quillRef.current.getEditor(); // 에디터 객체 가져오기
        // 1. 에디터 root의 innerHTML을 수정해주기
        // editor의 root는 에디터 컨텐츠들이 담겨있다. 거기에 img태그를 추가해준다.
        // 이미지를 업로드하면 -> 멀터에서 이미지 경로 URL을 받아와 -> 이미지 요소로 만들어 에디터 안에 넣어준다.
        // editor.root.innerHTML =
        //   editor.root.innerHTML + `<img src=${IMG_URL} /><br/>`; // 현재 있는 내용들 뒤에 써줘야한다.

        // 2. 현재 에디터 커서 위치값을 가져온다
        const range = editor.getSelection();
        // 가져온 위치에 이미지를 삽입한다
        editor.insertEmbed(range.index, 'image', IMG_URL);
      } catch (error) {
        console.log('이미지 불러오기 실패');
      }
    });
  };
//dnd 처리 핸들러
  const imageDropHandler = useCallback(async (dataUrl) => {
  try {
    // dataUrl을 이용하여 blob 객체를 생성
    const blob = await fetch(dataUrl).then(res => res.blob());
    // FormData 객체를 생성하고 'img' 필드에 blob을 추가
    const formData = new FormData();
    formData.append('img', blob);
    // FormData를 서버로 POST 요청을 보내 이미지 업로드를 처리
    const result = await axios.post('http://localhost:3001/img', formData);
    console.log('성공 시, 백엔드가 보내주는 데이터', result.data.url);
    // 서버에서 반환된 이미지 URL을 변수에 저장
    const IMG_URL = result.data.url;
    // Quill 에디터 인스턴스를 호출
    const editor = quillRef.current.getEditor();
    // 현재 커서 위치를 가져옵니다.
    const range = editor.getSelection();
    // 현재 커서 위치에 이미지 URL을 이용해 이미지 삽입
    editor.insertEmbed(range.index, 'image', IMG_URL);
  } catch (error) {
    // 이미지 업로드 중 에러가 발생할 경우 콘솔에 에러를 출력
    console.log('이미지 업로드 실패', error);
  }
}, []);

// Undo and redo functions for Custom Toolbar
  function undoChange() {
    this.quill.history.undo();
  }
  function redoChange() {
    this.quill.history.redo();
  }

// 새로운 3D 모델 블록 추가
  
  const modules = useMemo(() => ({
    toolbar: {
      container: "#toolbar",
      handlers: {
        "undo": undoChange,
        "redo": redoChange,
        "image": imageHandler,
      },
    },
    // undo, redo history
    history: {
      delay: 500,
      maxStack: 100,
      userOnly: true
    },
    // image resize 추가
    ImageResize: { parchment: Quill.import('parchment') },
    imageDropAndPaste: { handler: imageDropHandler },
    htmlEditButton: {
        debug: true, // logging, default:false
        msg: "Edit the content in HTML format", //Custom message to display in the editor, default: Edit HTML here, when you click "OK" the quill editor's contents will be replaced
        okText: "Ok", // Text to display in the OK button, default: Ok,
        cancelText: "Cancel", // Text to display in the cancel button, default: Cancel
        buttonHTML: "&lt;&gt;", // Text to display in the toolbar button, default: <>
        buttonTitle: "Show HTML source", // Text to display as the tooltip for the toolbar button, default: Show HTML source
        syntax: false, // Show the HTML with syntax highlighting. Requires highlightjs on window.hljs (similar to Quill itself), default: false
        prependSelector: 'div#myelement', // a string used to select where you want to insert the overlayContainer, default: null (appends to body),
        editorModules: {} // The default mod
      },
  }), [imageDropHandler]);

  const formats = [
    "header", "font", "size", "bold", "italic", "underline", "align", "strike", "script", "blockquote", "background", "list", "bullet", "indent",
    "link", "image", "video", "color", "code-block", "formula", "direction", "3d-model"
  ];

  return (
    <div className="text-editor">
      <div className="ThreeD-Views">
      </div>
      <EditorToolBar />
      <ReactQuill
        theme="snow"// 테마 설정 (여기서는 snow를 사용)
        value={editorHtml}
        onChange={handleChange}
        ref={quillRef}
        modules={modules}
        formats={formats}
      />
      <ThreeModelButton />
      <DragDrop />
    </div>
  );
};

export default MyEditor;