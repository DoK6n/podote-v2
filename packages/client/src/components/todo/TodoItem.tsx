import styled from '@emotion/styled';
import GoDocsButton from '../GoDocsButton';
import { memo, useRef } from 'react';
import {
  TodoRemoveButton,
  TodoEditButton,
  TodoEditCancel,
  TodoSaveButton,
} from './todoButtons';
import { TodoItemTitle, TodoItemCheckBox } from './todoItems';

interface Props {
  id: string;
  title: string;
  hasDocument?: boolean;
  docsId?: string;
  editable: boolean;
  isDone: boolean;
}

function TodoItem({
  id,
  title,
  hasDocument = false,
  docsId,
  editable,
  isDone = false,
}: Props) {
  const titleRef = useRef<HTMLDivElement | null>(null);

  return (
    <TodoItemWrapper>
      <TodoItemCheckBoxGroup>
        <TodoItemCheckBox id={id} isDone={isDone} />
      </TodoItemCheckBoxGroup>
      <TodoItemTitleGroup>
        <TodoItemTitle
          id={id}
          title={title}
          editable={editable}
          ref={titleRef}
        />
        {hasDocument && (
          <TodoItemIconWrapper>
            <GoDocsButton id={docsId} hasDocument={hasDocument} />
          </TodoItemIconWrapper>
        )}
        <TodoItemIconWrapper>
          {/* {editable ? <TodoSaveButton id={id} /> : <TodoEditButton id={id} />} */}
          {!editable && <TodoEditButton id={id} />}
          {editable && <TodoEditCancel id={id} ref={titleRef} />}
          <TodoRemoveButton />
        </TodoItemIconWrapper>
      </TodoItemTitleGroup>
    </TodoItemWrapper>
  );
}

const TodoItemWrapper = styled.div`
  gap: 5px;
  display: flex;
  align-items: center;
  border-radius: 6px;
  padding: 5px;
  margin-right: 1rem;
  &:hover {
    background-color: #3f3663;
  }
`;

/** 가장 좌측에 위치할 첫번째 그룹 - @example `checkBox` */
const TodoItemCheckBoxGroup = styled.div`
  display: flex;
  color: #756a98;
`;

/** 두번째 그룹 - @example `text`, `icons` */
const TodoItemTitleGroup = styled.div`
  display: flex;
  cursor: default;
  flex: 1 1 auto;
  min-width: 0;
  margin-right: 1rem;
`;

const TodoItemText = styled.div`
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  line-height: 1.6;
`;

/** TitleGroup에 들어갈 icon들 - @example `document`, `watchingDocument` */
const TodoItemIconWrapper = styled.span`
  margin: 0 0.5rem 0 0.5rem;
  color: #5a6678;
  display: flex;
  align-items: center;
`;

export default memo(TodoItem);
