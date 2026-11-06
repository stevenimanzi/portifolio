import React, { useState, useEffect } from 'react';
import './Skills.css';
import PageHero from '../components/PageHero';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const icons = {
  html: (
    <svg viewBox="0 0 24 24" fill="#E34F26">
      <path d="M1.5 0h21l-1.91 21.563L11.977 24l-8.564-2.438L1.5 0zm7.031 9.75l-.232-2.718 10.059.003.23-2.622L5.412 4.41l.698 8.01h9.126l-.326 3.426-2.91.804-2.955-.81-.188-2.11H6.248l.33 4.171L12 19.351l5.379-1.443.744-8.157H8.531z"/>
    </svg>
  ),
  css: (
    <svg viewBox="0 0 24 24" fill="#1572B6">
      <path d="M1.5 0h21l-1.91 21.563L11.977 24l-8.565-2.438L1.5 0zm17.09 4.41H5.41l.23 2.622h10.059l-.232 2.718H6.34l.698 8.01 4.939 1.373 4.981-1.385.326-3.426H14.65l-.188 2.11-2.484.68-2.446-.674-.23-2.585h8.046l.744-8.158.33-1.285z"/>
    </svg>
  ),
  javascript: (
    <svg viewBox="0 0 24 24" fill="#F7DF1E">
      <path d="M0 0h24v24H0V0zm22.034 18.276c-.175-1.095-.888-2.015-3.003-2.873-.736-.345-1.554-.585-1.797-1.14-.091-.33-.105-.51-.046-.705.15-.646.915-.84 1.515-.66.39.12.75.42.976.9 1.034-.676 1.034-.676 1.755-1.125-.27-.42-.404-.601-.586-.78-.63-.705-1.469-1.065-2.834-1.034l-.705.089c-.676.165-1.32.525-1.71 1.005-1.14 1.291-.811 3.541.569 4.471 1.365 1.02 3.361 1.244 3.616 2.205.24 1.17-.87 1.545-1.966 1.41-.811-.18-1.26-.586-1.755-1.336l-1.83 1.051c.21.48.45.689.81 1.109 1.74 1.756 6.09 1.666 6.871-1.004.029-.09.24-.705.074-1.65l.046.067zm-8.983-7.245h-2.248c0 1.938-.009 3.864-.009 5.805 0 1.232.063 2.363-.138 2.711-.33.689-1.18.601-1.566.48-.396-.196-.597-.466-.83-.855-.063-.105-.11-.196-.127-.196l-1.825 1.125c.305.63.75 1.172 1.324 1.517.855.51 2.004.675 3.207.405.783-.226 1.458-.691 1.811-1.411.51-.93.402-2.07.397-3.346.012-2.054 0-4.109 0-6.179l.004-.056z"/>
    </svg>
  ),
  react: (
    <svg viewBox="0 0 24 24" fill="#61DAFB">
      <path d="M14.23 12.004a2.236 2.236 0 0 1-2.235 2.236 2.236 2.236 0 0 1-2.236-2.236 2.236 2.236 0 0 1 2.235-2.236 2.236 2.236 0 0 1 2.236 2.236zm2.648-10.69c-1.346 0-3.107.96-4.888 2.622-1.78-1.653-3.542-2.602-4.887-2.602-.41 0-.783.093-1.106.278-1.375.793-1.683 3.264-.973 6.365C1.98 8.917 0 10.42 0 12.004c0 1.59 1.99 3.097 5.043 4.03-.704 3.113-.39 5.588.988 6.38.32.187.69.275 1.102.275 1.345 0 3.107-.96 4.888-2.624 1.78 1.654 3.542 2.603 4.887 2.603.41 0 .783-.09 1.106-.275 1.374-.792 1.683-3.263.973-6.365C22.02 15.096 24 13.59 24 12.004c0-1.59-1.99-3.097-5.043-4.032.704-3.11.39-5.587-.988-6.38-.318-.184-.688-.277-1.092-.278zm-.005 1.09v.006c.225 0 .406.044.558.127.666.382.955 1.835.73 3.704-.054.46-.142.945-.25 1.44-.96-.236-2.006-.417-3.107-.534-.66-.905-1.345-1.727-2.035-2.447 1.592-1.48 3.087-2.292 4.105-2.295zm-9.77.02c1.012 0 2.514.808 4.11 2.28-.686.72-1.37 1.537-2.02 2.442-1.107.117-2.154.298-3.113.538-.112-.49-.195-.964-.254-1.42-.23-1.868.054-3.32.714-3.707.19-.09.4-.127.563-.132zm4.882 3.05c.455.468.91.992 1.36 1.564-.44-.02-.89-.034-1.345-.034-.46 0-.915.01-1.36.034.44-.572.895-1.096 1.345-1.565zM12 8.1c.74 0 1.477.034 2.202.093.406.582.802 1.203 1.183 1.86.372.64.71 1.29 1.018 1.946-.308.655-.646 1.31-1.013 1.95-.38.66-.773 1.288-1.18 1.87-.728.063-1.466.098-2.21.098-.74 0-1.477-.035-2.202-.093-.406-.582-.802-1.204-1.183-1.86-.372-.64-.71-1.29-1.018-1.946.303-.657.646-1.313 1.013-1.954.38-.66.773-1.286 1.18-1.868.728-.064 1.466-.098 2.21-.098zm-3.635.254c-.24.377-.48.763-.704 1.16-.225.39-.435.782-.635 1.174-.265-.656-.49-1.31-.676-1.947.64-.15 1.315-.283 2.015-.386zm7.26 0c.695.103 1.365.23 2.006.387-.18.632-.405 1.282-.66 1.933-.2-.39-.41-.783-.64-1.174-.225-.392-.465-.774-.705-1.146zm3.063.675c.484.15.944.317 1.375.498 1.732.74 2.852 1.708 2.852 2.476-.005.768-1.125 1.74-2.857 2.475-.42.18-.88.342-1.355.493-.28-.958-.646-1.956-1.1-2.98.45-1.017.81-2.01 1.085-2.964zm-13.395.004c.278.96.645 1.957 1.1 2.98-.45 1.017-.812 2.01-1.086 2.964-.484-.15-.944-.318-1.37-.5-1.732-.737-2.852-1.706-2.852-2.474 0-.768 1.12-1.742 2.852-2.476.42-.18.88-.342 1.356-.494zm11.678 4.28c.265.657.49 1.312.676 1.948-.64.157-1.316.29-2.016.39.24-.375.48-.762.705-1.158.225-.39.435-.788.636-1.18zm-9.945.02c.2.392.41.783.64 1.175.23.39.465.772.705 1.143-.695-.102-1.365-.23-2.006-.386.18-.63.406-1.282.66-1.933zM17.92 16.32c.112.493.2.968.254 1.423.23 1.868-.054 3.32-.714 3.708-.147.09-.338.128-.563.128-1.012 0-2.514-.807-4.11-2.28.686-.72 1.37-1.536 2.02-2.44 1.107-.118 2.154-.3 3.113-.54zm-11.83.01c.96.234 2.006.415 3.107.532.66.905 1.345 1.727 2.035 2.446-1.595 1.483-3.092 2.295-4.11 2.295-.22-.005-.406-.05-.553-.132-.666-.38-.955-1.834-.73-3.703.054-.46.142-.944.25-1.438zm4.56.64c.44.02.89.034 1.345.034.46 0 .915-.01 1.36-.034-.44.572-.895 1.095-1.345 1.565-.455-.47-.91-.993-1.36-1.565z"/>
    </svg>
  ),
  php: (
    <svg viewBox="0 0 24 24" fill="#777BB4">
      <path d="M7.01 10.207h-.944l-.515 2.648h.838c.556 0 .97-.105 1.242-.314.272-.21.455-.559.55-1.049.092-.47.05-.802-.124-.995-.175-.193-.523-.29-1.047-.29zM12 5.688C5.373 5.688 0 8.514 0 12s5.373 6.313 12 6.313S24 15.486 24 12c0-3.486-5.373-6.312-12-6.312zm-3.26 7.451c-.261.25-.575.438-.917.551-.336.108-.765.164-1.285.164H5.357l-.327 1.681H3.652l1.23-6.326h2.65c.797 0 1.378.209 1.744.628.366.418.476 1.002.33 1.752a2.836 2.836 0 0 1-.305.847c-.143.255-.33.49-.561.703zm4.024.715l.543-2.799c.063-.318.039-.536-.068-.651-.107-.116-.336-.174-.687-.174H11.46l-.704 3.625H9.388l1.23-6.327h1.367l-.327 1.682h1.218c.767 0 1.295.134 1.586.401s.378.7.263 1.299l-.572 2.944h-1.389zm7.597-2.265a2.782 2.782 0 0 1-.305.847c-.143.255-.33.49-.561.703a2.44 2.44 0 0 1-.917.551c-.336.108-.765.164-1.286.164h-1.18l-.327 1.682h-1.378l1.23-6.326h2.649c.797 0 1.378.209 1.744.628.366.417.477 1.001.331 1.751zM17.766 10.207h-.943l-.516 2.648h.838c.557 0 .971-.105 1.242-.314.272-.21.455-.559.551-1.049.092-.47.049-.802-.125-.995s-.524-.29-1.047-.29z"/>
    </svg>
  ),
  python: (
    <svg viewBox="0 0 24 24" fill="#3776AB">
      <path d="M14.25.18l.9.2.73.26.59.3.45.32.34.34.25.34.16.33.1.3.04.26.02.2-.01.13V8.5l-.05.63-.13.55-.21.46-.26.38-.3.31-.33.25-.35.19-.35.14-.33.1-.3.07-.26.04-.21.02H8.77l-.69.05-.59.14-.5.22-.41.27-.33.32-.27.35-.2.36-.15.37-.1.35-.07.32-.04.27-.02.21v3.06H3.17l-.21-.03-.28-.07-.32-.12-.35-.18-.36-.26-.36-.36-.35-.46-.32-.59-.28-.73-.21-.88-.14-1.05-.05-1.23.06-1.22.16-1.04.24-.87.32-.71.36-.57.4-.44.42-.33.42-.24.4-.16.36-.1.32-.05.24-.01h.16l.06.01h8.16v-.83H6.18l-.01-2.75-.02-.37.05-.34.11-.31.17-.28.25-.26.31-.23.38-.2.44-.18.51-.15.58-.12.64-.1.71-.06.77-.04.84-.02 1.27.05zm-6.3 1.98l-.23.33-.08.41.08.41.23.34.33.22.41.09.41-.09.33-.22.23-.34.08-.41-.08-.41-.23-.33-.33-.22-.41-.09-.41.09zm13.09 3.95l.28.06.32.12.35.18.36.27.36.35.35.47.32.59.28.73.21.88.14 1.04.05 1.23-.06 1.23-.16 1.04-.24.86-.32.71-.36.57-.4.45-.42.33-.42.24-.4.16-.36.09-.32.05-.24.02-.16-.01h-8.22v.82h5.84l.01 2.76.02.36-.05.34-.11.31-.17.29-.25.25-.31.24-.38.2-.44.17-.51.15-.58.13-.64.09-.71.07-.77.04-.84.01-1.27-.04-1.07-.14-.9-.2-.73-.25-.59-.3-.45-.33-.34-.34-.25-.34-.16-.33-.1-.3-.04-.25-.02-.2.01-.13v-5.34l.05-.64.13-.54.21-.46.26-.38.3-.32.33-.24.35-.2.35-.14.33-.1.3-.06.26-.04.21-.02.13-.01h5.84l.69-.05.59-.14.5-.21.41-.28.33-.32.27-.35.2-.36.15-.36.1-.35.07-.32.04-.28.02-.21V6.07h2.09l.14.01zm-6.47 14.25l-.23.33-.08.41.08.41.23.33.33.23.41.08.41-.08.33-.23.23-.33.08-.41-.08-.41-.23-.33-.33-.23-.41-.08-.41.08z"/>
    </svg>
  ),
  laravel: (
    <svg viewBox="0 0 24 24" fill="#FF2D20">
      <path d="M12.013 0c-1.34 0-2.43 1.088-2.43 2.43v19.14c0 1.34 1.09 2.43 2.43 2.43 1.342 0 2.432-1.09 2.432-2.43V2.43C14.445 1.088 13.355 0 12.013 0zm4.55 1.708l-2.022 1.168c.843.916 1.365 2.146 1.365 3.493v11.262c0 1.346-.522 2.576-1.365 3.492l2.022 1.168c1.37-1.206 2.235-2.96 2.235-4.912V5.45c0-1.952-.865-3.706-2.235-4.912zM7.438 1.708C6.068 2.914 5.203 4.668 5.203 6.62v10.76c0 1.95.865 3.705 2.235 4.91l2.022-1.167c-.843-.915-1.365-2.145-1.365-3.492V5.37C8.095 4.02 8.618 2.79 9.46 1.875l-2.022-1.167zm12.35 2.825l-2.023 1.167c.394.662.625 1.442.625 2.274v8.05c0 .83-.23 1.61-.624 2.273l2.022 1.168c.89-.96 1.447-2.274 1.447-3.714V7.27c0-1.44-.556-2.754-1.446-3.715zM4.213 4.533C3.323 5.493 2.767 6.807 2.767 8.247v7.506c0 1.44.556 2.754 1.446 3.715l2.023-1.168c-.394-.663-.625-1.443-.625-2.274V7.974c0-.832.23-1.612.624-2.275l-2.022-1.166zm19.742 2.883l-2.022 1.168c.036.215.056.435.056.66v5.51c0 .227-.02.447-.056.662l2.022 1.168c.28-.567.44-1.2.44-1.87v-5.41c0-.67-.16-1.303-.44-1.87zM.046 7.416c.28.567.44 1.2.44 1.87v5.428c0 .67-.16 1.303-.44 1.87l2.022-1.168c-.036-.215-.056-.435-.056-.66V8.163c0-.225.02-.445.056-.66L.046 7.416z"/>
    </svg>
  ),
  figma: (
    <svg viewBox="0 0 24 24" fill="#F24E1E">
      <path d="M11.95 24c-3.327 0-6.025-2.697-6.025-6.024 0-3.328 2.698-6.026 6.025-6.026 3.329 0 6.026 2.698 6.026 6.026 0 3.327-2.697 6.024-6.026 6.024zm0-8.258c-1.233 0-2.234 1.002-2.234 2.234 0 1.233 1.001 2.233 2.234 2.233 1.234 0 2.235-1.001 2.235-2.233 0-1.232-1.001-2.234-2.235-2.234zm-6.025-3.791c0-3.327 2.698-6.024 6.025-6.024v12.049c-3.327 0-6.025-2.698-6.025-6.025zm2.234 0c0 1.232 1.001 2.233 2.234 2.233V7.718c-1.233 0-2.234 1.001-2.234 2.233zm9.817 0c0-3.327-2.697-6.024-6.026-6.024-3.327 0-6.025 2.697-6.025 6.024s2.698 6.025 6.025 6.025c3.329 0 6.026-2.698 6.026-6.025zm-2.235 0c0 1.232-1.001 2.233-2.234 2.233V7.718c1.233 0 2.234 1.001 2.234 2.233zM11.95 5.926c-3.327 0-6.025-2.698-6.025-6.026h12.051c0 3.328-2.698 6.026-6.026 6.026zm-2.234-3.792h4.468c0 1.233-1.001 2.234-2.234 2.234-1.233 0-2.234-1.001-2.234-2.234z"/>
    </svg>
  ),
  wordpress: (
    <svg viewBox="0 0 24 24" fill="#21759B">
      <path d="M21.469 6.825c.84 1.537 1.318 3.3 1.318 5.175 0 3.979-2.156 7.456-5.363 9.325l3.295-9.527c.615-1.54.82-2.771.82-3.864 0-.405-.026-.78-.07-1.11m-7.981.105c.647-.03 1.232-.105 1.232-.105.582-.075.514-.93-.067-.899 0 0-1.755.135-2.88.135-1.064 0-2.85-.15-2.85-.15-.585-.03-.661.855-.075.885 0 0 .54.061 1.125.09l1.68 4.605-2.37 7.08L5.354 6.9c.649-.03 1.234-.1 1.234-.1.585-.075.516-.93-.065-.896 0 0-1.746.138-2.874.138-.2 0-.438-.008-.69-.015C4.911 3.15 8.235 1.215 12 1.215c2.809 0 5.365 1.072 7.286 2.833-.046-.003-.091-.009-.141-.009-1.06 0-1.812.923-1.812 1.914 0 .89.513 1.643 1.06 2.531.411.72.89 1.643.89 2.977 0 .915-.354 1.994-.821 3.479l-1.075 3.585-3.9-11.61.001.014zM12 22.784c-1.059 0-2.081-.153-3.048-.437l3.237-9.406 3.315 9.087c.024.053.05.101.078.149-1.12.393-2.325.609-3.582.609M1.211 12c0-1.564.336-3.05.935-4.39L7.29 21.709C3.694 19.96 1.212 16.271 1.211 12M12 0C5.385 0 0 5.385 0 12s5.385 12 12 12 12-5.385 12-12S18.615 0 12 0"/>
    </svg>
  ),
  flutterflow: (
    <svg viewBox="0 0 24 24" fill="#00B5F8">
      <path d="M14.314 0L2.3 12 6 15.7 21.684.013h-7.357zm.014 11.072L7.857 17.53l6.47 6.47H21.7l-6.46-6.468 6.46-6.46h-7.37z"/>
    </svg>
  ),
  ecommerce: (
    <svg viewBox="0 0 24 24" fill="#3b82f6">
      <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2zm-9.83-3.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.13 0-.25-.11-.25-.25z"/>
    </svg>
  ),
  socialmedia: (
    <svg viewBox="0 0 24 24" fill="#3b82f6">
      <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
    </svg>
  ),
  ai: (
    <svg viewBox="0 0 24 24" fill="#3b82f6">
      <path d="M21 11.5v-1c0-.8-.7-1.5-1.5-1.5H16v-2c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v2H4.5C3.7 9 3 9.7 3 10.5v1c-.6 0-1 .4-1 1v3c0 .6.4 1 1 1v1.5c0 .8.7 1.5 1.5 1.5h15c.8 0 1.5-.7 1.5-1.5V16c.6 0 1-.4 1-1v-3c0-.6-.4-1-1-1zM10 7h4v2h-4V7zm10 10.5H4.5v-6H19.5v6z"/>
    </svg>
  ),
  cctv: (
    <svg viewBox="0 0 24 24" fill="#3b82f6">
      <path d="M18 10.48V6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-4.48l4 3.98v-11l-4 3.98zm-2-.79V18H4V6h12v3.69zM10 8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3zm0 4.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
    </svg>
  ),
  seo: (
    <svg viewBox="0 0 24 24" fill="#3b82f6">
      <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
    </svg>
  ),
  sales: (
    <svg viewBox="0 0 24 24" fill="#3b82f6">
      <path d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z"/>
    </svg>
  ),
  testing: (
    <svg viewBox="0 0 24 24" fill="#3b82f6">
      <path d="M19.8 18.4L14 10.67V6.5l1.35-1.69c.26-.33.03-.81-.39-.81H9.04c-.42 0-.65.48-.39.81L10 6.5v4.17L4.2 18.4c-.49.66-.02 1.6.8 1.6h14c.82 0 1.29-.94.8-1.6z"/>
    </svg>
  ),
  analysis: (
    <svg viewBox="0 0 24 24" fill="#3b82f6">
      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
    </svg>
  ),
  database: (
    <svg viewBox="0 0 24 24" fill="#3b82f6">
      <path d="M12 3C7.58 3 4 4.79 4 7v10c0 2.21 3.58 4 8 4s8-1.79 8-4V7c0-2.21-3.58-4-8-4zm0 2c3.87 0 6 1.5 6 2s-2.13 2-6 2-6-1.5-6-2 2.13-2 6-2zm6 12c0 .5-2.13 2-6 2s-6-1.5-6-2v-2.23c1.61.78 3.72 1.23 6 1.23s4.39-.45 6-1.23V17zm0-5c0 .5-2.13 2-6 2s-6-1.5-6-2V9.77C7.61 10.55 9.72 11 12 11s4.39-.45 6-1.23V12z"/>
    </svg>
  ),
  networking: (
    <svg viewBox="0 0 24 24" fill="#3b82f6">
      <path d="M4 6h18V4H4c-1.1 0-2 .9-2 2v11H0v3h14v-3H4V6zm19 2h-6c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h6c.55 0 1-.45 1-1V9c0-.55-.45-1-1-1zm-1 9h-4v-7h4v7z"/>
    </svg>
  )
};

const skillsData = [
  { name: 'HTML5', category: 'Frontend', icon: icons.html },
  { name: 'CSS', category: 'Frontend', icon: icons.css },
  { name: 'JavaScript', category: 'Frontend', icon: icons.javascript },
  { name: 'React', category: 'Frontend', icon: icons.react },
  { name: 'WordPress', category: 'Frontend', icon: icons.wordpress },
  { name: 'PHP', category: 'Backend', icon: icons.php },
  { name: 'Python', category: 'Backend', icon: icons.python },
  { name: 'Laravel', category: 'Backend', icon: icons.laravel },
  { name: 'Database Management', category: 'Backend', icon: icons.database },
  { name: 'Software Testing', category: 'Backend', icon: icons.testing },
  { name: 'Figma', category: 'Design & Tools', icon: icons.figma },
  { name: 'FlutterFlow', category: 'Design & Tools', icon: icons.flutterflow },
  { name: 'CCTV Installation', category: 'Design & Tools', icon: icons.cctv },
  { name: 'Networking', category: 'Design & Tools', icon: icons.networking },
  { name: 'SEO & Digital Marketing', category: 'Marketing & AI', icon: icons.seo },
  { name: 'E-Commerce', category: 'Marketing & AI', icon: icons.ecommerce },
  { name: 'Online Sales', category: 'Marketing & AI', icon: icons.sales },
  { name: 'Social Media Marketing', category: 'Marketing & AI', icon: icons.socialmedia },
  { name: 'AI Engineering', category: 'Marketing & AI', icon: icons.ai },
  { name: 'Project Analysis', category: 'Marketing & AI', icon: icons.analysis },
];

const educationData = [
  {
    institution: "Groupe Scolaire Des Parents, Huye",
    period: "2022",
    title: "Computer System and Technology",
    description: "This is where I fell in love with solving problems using technology. I gained hands-on skills in Networking, Basic Electronics, and Basic Electricity. I also learned Digital Phone System Installation and Computer Maintenance (both software and hardware).",
    skills: ["Networking", "Basic Electronics", "Hardware & Software", "Digital Systems"]
  },
  {
    institution: "Saint Laurent Gaseke TSS",
    period: "2023",
    title: "Software Development",
    description: "This is where I learned to use programming to solve real-world business problems. I gained strong skills in Web Application Development, UI/UX Design, and Database Management, focusing heavily on writing clean code and building scalable System Architectures.",
    skills: ["Web Application Development", "UI/UX Design", "Database Management", "System Architecture", "Clean Code"]
  },
  {
    institution: "Rwanda Polytechnic Musanze College",
    period: "2025",
    title: "E-Commerce",
    description: "I studied how online businesses operate, scale, and generate digital sales. I gained advanced skills in E-Commerce Solutions, SEO, and Digital Marketing. This empowered me to build highly optimized websites that actively drive revenue.",
    skills: ["E-Commerce Solutions", "SEO", "Digital Marketing", "Business Strategy"]
  }
];

import cert1 from '../assets/Certificate/5th Kyu Karate Certificate.pdf';
import cert2 from '../assets/Certificate/ChatGPT as Your Assistant.pdf';
import cert3 from '../assets/Certificate/Critical Thinking in the AI Era.pdf';
import cert4 from '../assets/Certificate/DTP Welcome to the Academy.pdf';
import cert5 from '../assets/Certificate/Data Analysis Fundamentals.pdf';
import cert6 from '../assets/Certificate/Exploratory Data Analysis with Python & GenAI.pdf';
import cert7 from '../assets/Certificate/Google Gemini Academy Certificate.pdf';
import cert8 from '../assets/Certificate/Programming Fundamentals.pdf';
import cert9 from '../assets/Certificate/Generative_AI_Foundations.pdf';

const certificatesData = [
  { id: 1, name: "Google Gemini Academy", file: cert7, type: "AI Certification", desc: "Official certification from Google Gemini Academy for mastering AI workflows." },
  { id: 2, name: "ChatGPT as Your Assistant", file: cert2, type: "AI Certification", desc: "Mastered leveraging ChatGPT for productivity and advanced development tasks." },
  { id: 3, name: "Data Analysis Fundamentals", file: cert5, type: "Data Science", desc: "Core concepts of data analysis and statistics for driving business decisions." },
  { id: 4, name: "EDA with Python & GenAI", file: cert6, type: "Data & AI", desc: "Exploratory Data Analysis utilizing Python and Generative AI for deep insights." },
  { id: 5, name: "Generative AI Foundations", file: cert9, type: "AI Certification", desc: "Comprehensive understanding of Generative AI models, architectures, and real-world applications." },
  { id: 6, name: "Critical Thinking in AI Era", file: cert3, type: "Professional Skill", desc: "Applying rigorous critical thinking to validate AI-generated solutions." },
  { id: 7, name: "Programming Fundamentals", file: cert8, type: "Software Dev", desc: "Strong foundation in software engineering principles and architectures." },
  { id: 8, name: "DTP Academy", file: cert4, type: "Academy", desc: "Digital Transformation Professionals Academy induction and coursework." },
  { id: 9, name: "5th Kyu Karate", file: cert1, type: "Martial Arts", desc: "Discipline, focus, and continuous self-improvement in traditional Karate." },
];

const getCircularOffset = (index: number, currentIndex: number, totalLength: number) => {
  let offset = index - currentIndex;
  const half = Math.floor(totalLength / 2);
  if (offset > half) offset -= totalLength;
  else if (offset < -(totalLength - 1 - half)) offset += totalLength;
  return offset;
};

function EducationTimeline() {
  const [activeIndex, setActiveIndex] = useState(0);
  const n = educationData.length;
  
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % n);
    }, 10000);
    return () => clearInterval(timer);
  }, [n]);

  const getCx = (index: number) => {
    return (index + 0.5) * (1000 / n);
  };
  
  const cx = getCx(activeIndex);
  
  const pathData = `M 0 80 L ${cx - 80} 80 C ${cx - 40} 80, ${cx - 40} 20, ${cx} 20 C ${cx + 40} 20, ${cx + 40} 80, ${cx + 80} 80 L 1000 80`;

  const activeEdu = educationData[activeIndex];

  return (
    <div className="contour-timeline-wrapper">
      
      <div 
        className="contour-card-container"
        style={{ left: `${cx / 10}%` }}
      >
        <div className="contour-card">
          <div className="contour-card-image">
            <span className="contour-badge">{activeEdu.period}</span>
          </div>
          <div className="contour-card-body">
            <div className="contour-subtitle">{activeEdu.institution.split(',')[0]}</div>
            <h3 className="contour-title">{activeEdu.title}</h3>
            <p className="contour-desc">{activeEdu.description.length > 120 ? activeEdu.description.substring(0, 120) + '...' : activeEdu.description}</p>
            <div className="contour-link">
              Explore chapter
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="7" y1="17" x2="17" y2="7"></line>
                <polyline points="7 7 17 7 17 17"></polyline>
              </svg>
            </div>
          </div>
        </div>
      </div>

      
      <div className="contour-svg-container">
        <svg viewBox="0 0 1000 100" preserveAspectRatio="none" className="contour-svg">
          <path d={pathData} className="contour-path" />
          <circle cx={cx} cy="20" r="8" className="contour-dot" />
          <circle cx={cx} cy="20" r="4" className="contour-dot-inner" />
        </svg>
      </div>

      
      <div className="contour-markers-row">
        {educationData.map((edu, idx) => (
          <div 
            key={idx} 
            className={`contour-marker ${activeIndex === idx ? 'active' : ''}`}
            onClick={() => setActiveIndex(idx)}
            style={{ width: `${100 / n}%` }}
          >
            <h2 className="contour-year">{edu.period}</h2>
            <p className="contour-label">{edu.institution.split(',')[0].split(' ')[0] + ' ' + (edu.institution.split(',')[0].split(' ')[1] || '')}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Skills() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [certCarouselIndex, setCertCarouselIndex] = useState(1);
  const [activeCertId, setActiveCertId] = useState<number | null>(null);

  const categories = ['All', 'Frontend', 'Backend', 'Design & Tools', 'Marketing & AI'];

  const filteredSkills = skillsData.filter(skill => 
    activeFilter === 'All' || skill.category === activeFilter
  );

  const gradients = [
    'linear-gradient(135deg, #1e00ff, #ff007b)',
    'linear-gradient(135deg, #3b82f6, #0091ff)',
    'linear-gradient(135deg, #ff8c00, #ff0055)',
    'linear-gradient(135deg, #8b5cf6, #3b82f6)',
    'linear-gradient(135deg, #ff0055, #6b00ff)',
    'linear-gradient(135deg, #00f2fe, #4facfe)',
    'linear-gradient(135deg, #fa709a, #fee140)',
    'linear-gradient(135deg, #43e97b, #38f9d7)',
    'linear-gradient(135deg, #30cfd0, #330867)',
    'linear-gradient(135deg, #a18cd1, #fbc2eb)'
  ];

  return (
    <div className="skills-page">
      
      <PageHero
        title="My Tech"
        accent="Stack"
        subtitle="Tools, languages, and frameworks I use to build scalable, high-performance web applications."
      />

      <div className="skills-content">
        <div className="skills-filters">
          {categories.map(category => (
            <button
              key={category}
              className={`filter-btn ${activeFilter === category ? 'active' : ''}`}
              onClick={() => setActiveFilter(category)}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="skills-grid">
          {filteredSkills.map((skill, index) => (
            <div 
              key={skill.name} 
              className="skill-card-new"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              
              <div 
                className="skill-card-bg" 
                style={{ background: gradients[index % gradients.length] }}
              >
                
                <div className="skill-card-grain"></div>
              </div>
              
              
              <div className="skill-card-folder">
                <div className="skill-tab-content">
                  <div className="skill-icon-wrapper-new">
                    {skill.icon}
                  </div>
                </div>
                
                <div className="skill-folder-arrow">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="7" y1="17" x2="17" y2="7"></line>
                    <polyline points="7 7 17 7 17 17"></polyline>
                  </svg>
                </div>

                <div className="skill-body-content">
                  <h3 className="skill-name-new">{skill.name}</h3>
                  <p className="skill-desc-new">Fully customized for {skill.category.toLowerCase()}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        
        <div className="education-section">
          <div className="education-header">
            <h2 className="education-title">Where I Learned</h2>
            <p className="skills-subtitle">The educational journey that shaped my technical foundation and business expertise.</p>
          </div>
          
          <EducationTimeline />
        </div>

        
        <div className="education-section" style={{marginTop: '4rem'}}>
          <div className="education-header">
            <h2 className="education-title">Certifications</h2>
            <p className="skills-subtitle">Professional qualifications, academies, and personal achievements.</p>
          </div>
          
          <div className="arc-carousel-container" style={{marginTop: '4rem', perspective: '1200px', height: '440px', minHeight: 'auto'}}>
            {certificatesData.map((cert, index) => {
              const offset = getCircularOffset(index, certCarouselIndex, certificatesData.length);
              const isExpanded = activeCertId === cert.id;
              
              const x = offset * 260; 
              const z = Math.abs(offset) * -200; 
              const rotateY = offset * -25;
              const rotateZ = offset * 2;
              const scale = offset === 0 ? 1 : 1 - (Math.abs(offset) * 0.05);

              return (
                <div 
                  key={cert.id}
                  className={`arc-carousel-card project-arc-card ${isExpanded ? 'expanded' : ''} ${offset === 0 ? 'active' : ''}`}
                  style={{
                    transform: `translateX(${x}px) translateZ(${z}px) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg) scale(${scale})`,
                    zIndex: offset === 0 ? 20 : 10 - Math.abs(offset),
                    padding: 0,
                    overflow: 'hidden'
                  } as React.CSSProperties}
                  onClick={() => {
                    if (offset !== 0) {
                      setCertCarouselIndex(index);
                    } else {
                      setActiveCertId(activeCertId === cert.id ? null : cert.id);
                    }
                  }}
                >
                  <div className="card-content-wrapper" style={{display: 'flex', flexDirection: 'column', height: '100%', width: '100%'}}>
                    <div className="project-expanded-image" style={{width: '100%', height: '180px', flexShrink: 0, borderBottom: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden', background: gradients[index % gradients.length], display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5"><path d="M12 14c3.314 0 6-2.686 6-6s-2.686-6-6-6-6 2.686-6 6 2.686 6 6 6z" strokeLinecap="round" strokeLinejoin="round"/><path d="M8.21 13.89L7 23l5-3 5 3-1.21-9.11" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                    
                    <div style={{padding: '1.2rem', flex: 1, display: 'flex', flexDirection: 'column'}}>
                      <h3 style={{fontSize: '1.1rem', marginBottom: '0.4rem', color: '#fff'}}>{cert.name}</h3>
                      <p className="summary" style={{color: '#3b82f6', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.1em', marginBottom: '1rem'}}>{cert.type}</p>
                      
                      <p style={{fontSize: '0.9rem', color: '#ccc', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'}}>{cert.desc}</p>
                      
                      {offset === 0 && (
                        <div className="read-more-hint" style={{marginTop: 'auto', textDecoration: 'none', display: 'block'}}>
                          Click to view full certificate →
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          
          {activeCertId && (() => {
            const certIndex = certificatesData.findIndex(c => c.id === activeCertId);
            const cert = certificatesData[certIndex];
            if (!cert) return null;
            const hasPrev = certIndex > 0;
            const hasNext = certIndex < certificatesData.length - 1;
            return (
              <div className="cert-modal-overlay" onClick={() => setActiveCertId(null)}>
                <div className="cert-modal" onClick={(e) => e.stopPropagation()}>
                  <div className="cert-modal-header">
                    <div>
                      <h2 className="cert-modal-title">{cert.name}</h2>
                      <p className="cert-modal-type">{cert.type} · {certIndex + 1} / {certificatesData.length}</p>
                    </div>
                    <div style={{display: 'flex', gap: '0.8rem', alignItems: 'center'}}>
                      <a href={cert.file} download className="cert-download-btn">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                          <polyline points="7 10 12 15 17 10"></polyline>
                          <line x1="12" y1="15" x2="12" y2="3"></line>
                        </svg>
                        Download
                      </a>
                      <button className="cert-close-btn" onClick={() => setActiveCertId(null)}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="cert-modal-body">
                    
                    <button 
                      className={`cert-nav-btn cert-nav-prev ${!hasPrev ? 'disabled' : ''}`}
                      disabled={!hasPrev}
                      onClick={() => { if (hasPrev) { setActiveCertId(certificatesData[certIndex - 1].id); setCertCarouselIndex(certIndex - 1); } }}
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 18 9 12 15 6"></polyline>
                      </svg>
                    </button>

                    <Document file={cert.file} loading={<div className="cert-loading">Loading certificate...</div>}>
                      <Page pageNumber={1} width={600} renderTextLayer={false} renderAnnotationLayer={false} />
                    </Document>

                    
                    <button 
                      className={`cert-nav-btn cert-nav-next ${!hasNext ? 'disabled' : ''}`}
                      disabled={!hasNext}
                      onClick={() => { if (hasNext) { setActiveCertId(certificatesData[certIndex + 1].id); setCertCarouselIndex(certIndex + 1); } }}
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6"></polyline>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}
          
          <div className="carousel-controls" style={{marginTop: '2rem'}}>
            <button 
              className="carousel-btn prev-btn" 
              onClick={() => setCertCarouselIndex(Math.max(0, certCarouselIndex - 1))}
              disabled={certCarouselIndex === 0}
            >
              ← Prev
            </button>
            <div className="carousel-indicators">
              {certificatesData.map((_, index) => (
                <span 
                  key={index} 
                  className={`indicator-dot ${index === certCarouselIndex ? 'active' : ''}`}
                  onClick={() => {
                    setCertCarouselIndex(index);
                    setActiveCertId(null);
                  }}
                />
              ))}
            </div>
            <button 
              className="carousel-btn next-btn" 
              onClick={() => setCertCarouselIndex(Math.min(certificatesData.length - 1, certCarouselIndex + 1))}
              disabled={certCarouselIndex === certificatesData.length - 1}
            >
              Next →
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
