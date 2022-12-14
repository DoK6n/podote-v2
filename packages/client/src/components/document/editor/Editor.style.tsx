import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { colors } from '../../../styles/colors';

const extensionCallOutStyles = css`
  .remirror-editor div[data-callout-type] {
    display: flex;
    margin-left: 0;
    margin-right: 0;
    margin-block-start: 1em;
    margin-block-end: 1em;
    margin-inline-end: 40px;
    padding: 10px;
    border-left: 0.25em solid transparent;
    border-top-right-radius: 4px;
    border-bottom-right-radius: 4px;
  }
  .remirror-editor
    div[data-callout-type]
    > :not(.remirror-callout-emoji-wrapper) {
    margin-left: 8px;
    flex-grow: 1;
  }
  .remirror-editor div[data-callout-type='info'] {
    background: #3298dc11;
    border-left-color: #3298dc;
  }
  .remirror-editor div[data-callout-type='warning'] {
    background: #ffdd5711;
    border-left-color: #ffdd57;
  }
  .remirror-editor div[data-callout-type='error'] {
    background: #f1466811;
    border-left-color: #f14668;
  }
  .remirror-editor div[data-callout-type='success'] {
    background: #48c77411;
    border-left-color: #48c774;
  }
  .remirror-editor div[data-callout-type='blank'] {
    background: ${colors.purple1}5c;
    border-left-color: ${colors.purple1};
  }
  .remirror-editor.ProseMirror hr {
    background-color: ${colors.purple1};
    border: 0;
    box-sizing: content-box;
    height: 0.25em;
    margin: 24px 0;
    overflow: hidden;
    padding: 0;
  }
  .remirror-editor.ProseMirror blockquote {
    padding-left: 20px;
    border-left: 0.25em solid ${colors.purple1};
  }
`;

export const extensionListItemStyles = css`
  & .remirror-editor li.remirror-list-item-with-custom-mark {
    color-scheme: dark;
    &[data-checked] label.remirror-list-item-marker-container {
      input[type='checkbox'] {
        accent-color: #615973;
        opacity: 0.6;
      }
    }
    & label.remirror-list-item-marker-container {
      & > .remirror-collapsible-list-item-button {
        background: ${colors.purple7};
        &.disabled {
          background: ${colors.purple6};
        }
      }
    }
    & div > ul > div.remirror-list-spine {
      border-left-color: ${colors.purple1};
    }
  }
`;

export const CustomThemeStyledCss = styled.div<{ editable?: boolean }>`
  width: 100%;
  padding: 1rem 0 1rem 0;
  color: ${colors.text0};
  strong,
  b,
  strong *,
  b * {
    // styled-reset?????? ?????? font: inherit??? ????????? ????????? bold, italic ?????????
    font-weight: bold;
  }
  em,
  i,
  em *,
  i {
    font-style: italic;
  }
  a {
    color: ${colors.border0};
  }
  .remirror-editor .ProseMirror-selectednode {
    outline: none;
  }
  .remirror-theme .ProseMirror {
    box-shadow: transparent 0px 0px 0px 0.1em;
    min-height: 0px;
    flex: 1;
    padding: 0 var(--rmr-space-3) 0 var(--rmr-space-3);
    &:active,
    &:focus {
      box-shadow: none;
      /* box-shadow: var(--rmr-color-outline) 0 0 0 0.2rem; */
    }
  }
  .remirror-theme h1,
  .remirror-theme h2,
  .remirror-theme h3,
  .remirror-theme h4,
  .remirror-theme h5,
  .remirror-theme h6 {
    color: ${colors.text1};
  }
  .remirror-editor-wrapper {
    padding-top: 0;
  }
  .remirror-theme {
    --rmr-color-selection-background: var(--rmr-color-outline);
    --rmr-color-selection-shadow: inherit;
    --rmr-color-selection-text: ${colors.text0};
    --rmr-color-selection-caret: inherit;
    height: 100%;
  }

  .ProseMirror.remirror-editor {
    overflow-y: hidden;
    padding-top: 1rem;
    padding-bottom: 1rem;
  }

  .remirror-theme .remirror-editor-wrapper .remirror-editor code {
    background: ${colors.purple1};
    padding: 3px 8px 3px 8px;
    font-size: 85%;
    border-radius: 6px;
  }
  .remirror-editor-wrapper {
    margin-top: 1rem;
    margin-bottom: 1rem;
  }

  .Mui-selected,
  .Mui-selected:hover,
  .Mui-selected:active {
    background: ${colors.purple3};
  }

  // ?????? ???????????? ????????? ???????????? ?????? ??????
  & .remirror-editor .remirror-resizable-view > div {
    display: ${({ editable = true }) =>
      editable === false ? 'none' : 'col-resize'} !important;
    cursor: ${({ editable = true }) =>
      editable === false ? 'default' : 'col-resize'} !important;
  }

  ${extensionCallOutStyles}
  ${extensionListItemStyles}
`;
