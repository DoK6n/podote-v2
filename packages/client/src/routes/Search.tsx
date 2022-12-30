import { css } from '@emotion/react';
import { useEffect, useState } from 'react';
import {
  LoaderFunction,
  Outlet,
  redirect,
  useNavigate,
  useSearchParams,
} from 'react-router-dom';
import { Block } from '../components/base';
import Footer from '../components/Footer';
import MobileHeader from '../components/Header';
import { useDebounce } from '../hooks';
import { colors } from '../styles/colors';
import { TodoItem } from '../components/todo';
import { checkIsLoggedIn } from '../lib/protectRoute';
import { useRetrieveAllTodosQuery } from '../lib/graphql/query/query.generated';
import { Todo } from '../lib/graphql/types';
import { getSearchData } from '../lib/fuzzySearch';

/**
 * 내 할일 검색 하는 화면
 *
 * Loader에서 로그인 체크 후 비로그인시 로그인 화면으로 이동
 *  */
export const searchLoader: LoaderFunction = async ({ request }) => {
  const isLoggedIn = checkIsLoggedIn();
  if (!isLoggedIn) return redirect('/auth/login?next=/search');

  return {};
};

function Search() {
  const [searchData, setSearchData] = useState<Todo[]>([]);
  const { loading, error, data } = useRetrieveAllTodosQuery();

  const [searchParams] = useSearchParams();
  const [searchText, setSearchText] = useState(searchParams.get('q') ?? '');
  const navigate = useNavigate();
  const [debouncedSearchText] = useDebounce(searchText, 300);

  useEffect(() => {
    if (!data) return;
    const todos = data.retrieveAllTodos as Todo[];

    navigate(`/search?q=${debouncedSearchText}`);
    setSearchData(getSearchData(debouncedSearchText, todos));
  }, [debouncedSearchText, navigate]);

  return (
    <>
      <MobileHeader
        title={
          <input
            css={inputStyle}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        }
      />
      <Block>
        {searchData.length !== 0 ? (
          searchData.map((todo) => (
            <TodoItem
              id={todo.id}
              title={todo.title}
              hasDocument={todo.documentId ? true : false}
              isDone={todo.done}
              documentId={todo.documentId}
              editable={todo.editable}
              key={todo.id}
            />
          ))
        ) : (
          <Outlet />
        )}
      </Block>
      <Footer />
    </>
  );
}

const inputStyle = css`
  font-size: 1rem;
  font-family: inherit;
  border-radius: 8px;
  padding: 0.5rem 0.75rem;
  background: ${colors.purple1};
  border: 1px solid ${colors.border2};

  color: ${colors.text1};
  line-height: 1.5;
  margin: 0;
  outline: none;

  width: 60vw;
  padding-left: 2rem;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' class='h-6 w-6' fill='none' viewBox='0 0 24 24' stroke='%23999' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' /%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: 0.625rem 0.75rem;
  background-size: 1rem;
  position: relative;

  &:hover {
  }
`;

const cardStyle = css`
  width: 100%;
  height: 4rem;
  border-radius: 12px;
  min-height: 84px;
  box-shadow: 0 0 3px rgb(0 0 0 / 15%);
  display: block;
  margin-bottom: 16px;
  padding: 2rem;
`;

export default Search;
