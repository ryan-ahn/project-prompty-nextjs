/**
 * Author : Ryan
 * Date : 2023-04-02
 * Desc : index
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import styled, { css } from 'styled-components';
import { TProps } from 'pages/threads';
import { DUMMY } from '@common/data';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@libs/redux/modules';
import {
  POST_GPT_CHAIN_REQUEST,
  POST_GPT_RELATION_REQUEST,
  INIT_THREAD,
  SET_STATIC_DATA,
  POST_PROMPT_REQUEST,
} from '@libs/redux/modules/main/actions';

type TVisibility = {
  attrVisibility: boolean;
};

type TFocus = {
  attrFocus: boolean;
};

export default function index({ search }: TProps) {
  // Root State
  const { data, addQuestion, isLoadingData, isLoadingQuestion } = useSelector(
    (state: RootState) => state.main,
  );
  // State
  const [input, setInput] = useState<string>('');
  const [focus, setFocus] = useState<boolean>(false);
  // Ref
  const inputRef = useRef<HTMLInputElement>(null);
  // Hooks
  const router = useRouter();
  const dispatch = useDispatch();

  const onChangeInputText = useCallback(
    (value: string) => {
      setInput(value);
    },
    [input],
  );

  const onClickSearch = useCallback(() => {
    if (input.length > 0) {
      dispatch({ type: POST_GPT_CHAIN_REQUEST, payload: { assistant: data, input: input } });
      dispatch({ type: POST_GPT_RELATION_REQUEST, payload: { assistant: data, input: input } });
      setInput('');
    }
  }, [input, data]);

  const onKeyPressEnter = useCallback(
    (e: any) => {
      if (input.length > 0 && e.key === 'Enter') {
        dispatch({ type: POST_GPT_CHAIN_REQUEST, payload: { assistant: data, input: input } });
        dispatch({ type: POST_GPT_RELATION_REQUEST, payload: { assistant: data, input: input } });
        setInput('');
      }
    },
    [input, data],
  );

  const onClickCreatePrompt = useCallback(() => {
    dispatch({ type: POST_PROMPT_REQUEST, payload: { promptList: data, category: 0 } });
  }, [data]);

  const onClickRouteToMain = useCallback(() => {
    router.push('/');
  }, []);

  const onClickAddData = useCallback(
    (text: string) => {
      dispatch({ type: POST_GPT_CHAIN_REQUEST, payload: { assistant: data, input: text } });
      dispatch({ type: POST_GPT_RELATION_REQUEST, payload: { assistant: data, input: text } });
    },
    [data],
  );

  const onClickAddQuestionReload = useCallback(() => {
    if (data !== null) {
      dispatch({
        type: POST_GPT_RELATION_REQUEST,
        payload: { assistant: data, input: data[data.length - 1].prompt },
      });
    }
  }, [data]);

  useEffect(() => {
    if (isLoadingData || isLoadingQuestion) {
      window.scrollTo({ top: 10000, behavior: 'smooth' });
    }
  }, [isLoadingData, isLoadingQuestion]);

  useEffect(() => {
    if (search === 'sample1') {
      dispatch({
        type: SET_STATIC_DATA,
        payload: { promptList: DUMMY[0].promptList, addQuestion: DUMMY[0].addQuestion },
      });
    } else if (search === 'sample2') {
      dispatch({
        type: SET_STATIC_DATA,
        payload: { promptList: DUMMY[1].promptList, addQuestion: DUMMY[1].addQuestion },
      });
    } else if (search === 'sample3') {
      dispatch({
        type: SET_STATIC_DATA,
        payload: { promptList: DUMMY[2].promptList, addQuestion: DUMMY[2].addQuestion },
      });
    } else {
      dispatch({ type: POST_GPT_CHAIN_REQUEST, payload: { assistant: data, input: search } });
      dispatch({ type: POST_GPT_RELATION_REQUEST, payload: { assistant: data, input: search } });
    }
  }, [search]);

  const routeChangeStart = useCallback(() => {
    dispatch({ type: INIT_THREAD });
  }, []);

  useEffect(() => {
    router.events.on('routeChangeStart', routeChangeStart);
    return () => {
      router.events.off('routeChangeStart', routeChangeStart);
    };
  }, [router.events]);

  // Render Item
  const renderItem = useCallback(
    (data: any) => {
      return (
        <ItemWrapper>
          <PromptBox>
            <h2>{data.prompt}</h2>
          </PromptBox>
          <ReplyBox>
            <LineBox>
              <div>
                <img src={'static/reply.png'} alt="reply" />
                <p>AI의 답변이에요</p>
              </div>
            </LineBox>
            <p>{data.answer}</p>
          </ReplyBox>
        </ItemWrapper>
      );
    },
    [data, addQuestion],
  );

  const renderAddQuestion = useCallback(() => {
    if (addQuestion !== null && !isLoadingQuestion) {
      return (
        <ItemWrapper>
          <LineBox>
            <div>
              <img src={'static/add_question.png'} alt="reply" />
              <p>이런 추가 질문은 어때요?</p>
            </div>
            <img src={'static/button-reload.png'} alt="reload" onClick={onClickAddQuestionReload} />
          </LineBox>
          {addQuestion
            .replace(/[1-9]. |"|-|- /g, '')
            .replace(/\n\n/g, '\n')
            .split('\n')
            .filter(line => line.length > 0 || line !== ' ')
            .map((line, index) => (
              <QuestionBox key={index} onClick={() => onClickAddData(line)}>
                <p>{`${index + 1}. ${line}`}</p>
                <img src={'static/plus.png'} alt="add" />
              </QuestionBox>
            ))}
        </ItemWrapper>
      );
    } else {
      return (
        <ItemWrapper>
          <LineBox>
            <div>
              <img src={'static/add_question.png'} alt="reply" />
              <p>이런 추가 질문은 어때요?</p>
            </div>
          </LineBox>
          <SkeletonQuestion />
          <SkeletonQuestion />
          <SkeletonQuestion />
        </ItemWrapper>
      );
    }
  }, [data, addQuestion, isLoadingQuestion]);

  // Render List
  const renderList = useCallback(() => {
    if (data) {
      return data.map((item, index) => <ListWrapper key={index}>{renderItem(item)}</ListWrapper>);
    } else {
      return (
        <ItemWrapper>
          <SkeletonPrompt />
          <ReplyBox>
            <LineBox>
              <div>
                <img src={'static/reply.png'} alt="reply" />
                <p>AI의 답변이에요</p>
              </div>
            </LineBox>
            <SkeletonAnswer />
            <SkeletonAnswer />
            <SkeletonAnswer />
          </ReplyBox>
        </ItemWrapper>
      );
    }
  }, [data]);

  return (
    <Wrapper>
      <HeaderArea>
        <div>
          <img src={'static/logo_white.png'} alt="logo" onClick={onClickRouteToMain} />
          <div>
            <button onClick={onClickCreatePrompt}>{'공유하기'}</button>
            <button onClick={onClickRouteToMain}>{'새로 질문하기'}</button>
          </div>
        </div>
      </HeaderArea>
      <ContentArea>{renderList()}</ContentArea>
      <SkeletonArea attrVisibility={data !== null && isLoadingData}>
        <ItemWrapper>
          <SkeletonPrompt />
          <ReplyBox>
            <LineBox>
              <div>
                <img src={'static/reply.png'} alt="reply" />
                <p>AI의 답변이에요</p>
              </div>
            </LineBox>
            <SkeletonAnswer />
            <SkeletonAnswer />
            <SkeletonAnswer />
          </ReplyBox>
        </ItemWrapper>
      </SkeletonArea>
      <AddQuestionArea>{renderAddQuestion()}</AddQuestionArea>
      <AddPromptArea>
        <SearchBox>
          <InputBox
            ref={inputRef}
            value={input}
            onFocus={() => setFocus(true)}
            onBlur={() => setFocus(false)}
            attrFocus={focus}
            placeholder="추가로 물어보세요!"
            onChange={e => onChangeInputText(e.target.value)}
            onKeyUp={onKeyPressEnter}
          />
          <ButtonBox>
            <img src={'static/arrow-enter.png'} alt="enter" onClick={onClickSearch} />
          </ButtonBox>
          <CloseBox attrVisibility={input.length > 0} onClick={() => setInput('')}>
            <img src={'static/button_close.png'} alt="close" />
          </CloseBox>
        </SearchBox>
      </AddPromptArea>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  ${({ theme }) => theme.flexSet('flex-start', 'center', 'column')};
  ${({ theme }) => theme.boxSet('100%', 'auto', '0px')};
`;

const HeaderArea = styled.nav`
  position: fixed;
  ${({ theme }) => theme.flexSet('center', 'center', 'row')};
  ${({ theme }) => theme.boxSet('100%', '55px', '0px')};
  padding: 0 20px;
  border-bottom: 1px solid #202020;
  background-color: #101010;
  z-index: 2;
  & > div {
    ${({ theme }) => theme.flexSet('space-between', 'center', 'row')};
    ${({ theme }) => theme.boxSet('100%', '100%', '0px')};
    max-width: 800px;
    & > img {
      ${({ theme }) => theme.boxSet('auto', '40px', '0px')};
      cursor: pointer;
    }
    & > div {
      display: flex;
      gap: 10px;
      & > button {
        padding: 8px 15px;
        border-radius: 20px;
        color: white;
        background-color: #009ffc;
        ${({ theme }) => theme.fontSet(14, 500, 20)};
        cursor: pointer;
      }
    }
  }
`;

const ContentArea = styled.section`
  ${({ theme }) => theme.flexSet('flex-start', 'center', 'column')};
  ${({ theme }) => theme.boxSet('100%', 'auto', '0px')};
  margin-top: 55px;
  max-width: 800px;
  border-left: 1px solid #202020;
  border-right: 1px solid #202020;
`;

const AddQuestionArea = styled.section`
  ${({ theme }) => theme.flexSet('flex-start', 'flex-start', 'column')};
  ${({ theme }) => theme.boxSet('100%', 'auto', '0px')};
  max-width: 800px;
  padding-bottom: 150px;
  border-left: 1px solid #202020;
  border-right: 1px solid #202020;
  border-bottom: 1px solid #202020;
`;

const ListWrapper = styled.div`
  width: 100%;
`;
const ItemWrapper = styled.div`
  ${({ theme }) => theme.boxSet('100%', 'auto', '0px')};
  ${({ theme }) => theme.flexSet('flex-start', 'flex-start', 'column')};
  padding: 25px 25px 0 25px;
  @media (max-width: 800px) {
    width: 100%;
  }
`;

const PromptBox = styled.div`
  & > h2 {
    color: #f1f1f1;
    ${({ theme }) => theme.fontSet(20, 500, 28)};
    white-space: pre-wrap;
    margin-bottom: 15px;
    word-break: break-all;
  }
`;

const ReplyBox = styled.div`
  width: 100%;
  border-bottom: 1px solid #202020;
  padding-bottom: 30px;
  & > p {
    color: #c1c1c1;
    ${({ theme }) => theme.fontSet(15, 400, 25)};
    white-space: pre-wrap;
    word-break: break-all;
  }
`;

const LineBox = styled.div`
  ${({ theme }) => theme.flexSet('space-between', 'center', 'row')};
  ${({ theme }) => theme.boxSet('100%', '100%', '0px')};
  & > div {
    ${({ theme }) => theme.flexSet('flex-start', 'center', 'row')};
    ${({ theme }) => theme.boxSet('100%', '35px', '0px')};
    & > img {
      ${({ theme }) => theme.boxSet('14px', 'auto', '0px')};
      margin-right: 10px;
    }
    & > p {
      color: #009ffc;
      ${({ theme }) => theme.fontSet(14, 400, 20)};
    }
  }
  & > img {
    ${({ theme }) => theme.boxSet('25px', 'auto', '0px')};
  }
`;

const QuestionBox = styled.div`
  ${({ theme }) => theme.boxSet('100%', 'auto', '20px')};
  ${({ theme }) => theme.flexSet('space-between', 'center', 'row')};
  padding: 5px 15px;
  margin-top: 10px;
  border: 1px solid white;
  cursor: pointer;
  &:hover {
    background-color: rgba(0, 0, 0, 0.8);
    border: 1px solid #009ffc;
  }
  & > p {
    ${({ theme }) => theme.flexSet('flex-start', 'center', 'row')};
    ${({ theme }) => theme.fontSet(14, 400, 20)};
  }
  & > img {
    ${({ theme }) => theme.boxSet('15px', 'auto', '0px')};
    margin-left: 10px;
  }
`;

const AddPromptArea = styled.div`
  position: fixed;
  bottom: 50px;
  ${({ theme }) => theme.flexSet('center', 'center', 'row')};
  ${({ theme }) => theme.boxSet('100%', 'auto', '0px')}
  padding: 0 25px;
  & > div {
    ${({ theme }) => theme.boxSet('100%', '50px', '25px')};
    ${({ theme }) => theme.flexSet('space-between', 'center', 'row')};
    border: 1px solid white;
  }
`;

const SearchBox = styled.div`
  position: relative;
  ${({ theme }) => theme.boxSet('100%', '50px', '0px')};
  max-width: 550px;
`;

const InputBox = styled.input<TFocus>`
  ${({ theme }) => theme.boxSet('100%', '100%', '25px')};
  padding: 0 90px 0 30px;
  border: 1.5px solid #606060;
  background-color: #202020;
  color: white;
  ${({ theme }) => theme.fontSet(18, 400, 25)};
  ${props =>
    props.attrFocus &&
    css`
      background-color: #000000;
    `}
`;

const ButtonBox = styled.button`
  position: absolute;
  top: 5px;
  right: 5px;
  ${({ theme }) => theme.flexSet('center', 'center', 'row')};
  ${({ theme }) => theme.boxSet('40px', '40px', '50%')};
  background: linear-gradient(to top, #2af499, #009ffc);
  cursor: pointer;
  :hover {
    opacity: 0.8;
  }
  & > img {
    ${({ theme }) => theme.boxSet('80%', 'auto', '50%')};
  }
`;

const CloseBox = styled.button<TVisibility>`
  position: absolute;
  top: 15px;
  right: 50px;
  visibility: hidden;
  cursor: pointer;
  :hover {
    opacity: 0.8;
  }
  & > img {
    ${({ theme }) => theme.boxSet('20px', '20px', '0px')};
  }
  ${props =>
    props.attrVisibility &&
    css`
      visibility: visible;
    `}
`;

const SkeletonArea = styled.div<TVisibility>`
  ${({ theme }) => theme.flexSet('flex-start', 'flex-start', 'column')};
  ${({ theme }) => theme.boxSet('100%', 'auto', '0px')};
  max-width: 800px;
  border-left: 1px solid #202020;
  border-right: 1px solid #202020;
  display: none;
  ${props =>
    props.attrVisibility &&
    css`
      display: block;
    `}
`;

const SkeletonPrompt = styled.div`
  ${({ theme }) => theme.boxSet('70%', '30px', '20px')};
  margin: 8px 0;
  animation: skeleton-ui 1.8s infinite ease-in-out;
  -webkit-animation: skeleton-ui 1.8s infinite ease-in-out;
`;

const SkeletonAnswer = styled.div`
  ${({ theme }) => theme.boxSet('100%', '20px', '20px')};
  margin: 10px 0;
  animation: skeleton-ui 1.8s infinite ease-in-out;
  -webkit-animation: skeleton-ui 1.8s infinite ease-in-out;
`;

const SkeletonQuestion = styled.div`
  ${({ theme }) => theme.boxSet('100%', '32px', '20px')};
  margin-top: 10px;
  animation: skeleton-ui 1.8s infinite ease-in-out;
  -webkit-animation: skeleton-ui 1.8s infinite ease-in-out;
`;
