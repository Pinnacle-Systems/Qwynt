import React, { useEffect, useState } from 'react'
import useOutsideClick from '../../../CustomHooks/handleOutsideClick';
import { useDispatch } from "react-redux";
import { push } from "../../../redux/features/opentabs";


const PageSearch = ({ pageList }) => {
    const [isListShow, setIsListShow] = useState(false)
    const inputRef = useOutsideClick(() => { setIsListShow(false) })
    const [filteredPages, setFilteredPages] = useState(pageList)
    const [search, setSearch] = useState("");
    const dispatch = useDispatch();



    useEffect(() => {
        let pageSearchComponent = document.getElementById("pageSearch");
        pageSearchComponent.addEventListener('keydown', function (ev) {
            var focusableElementsString = '[tabindex="0"]';
            let ol = document.querySelectorAll(focusableElementsString);
            if (ev.key === "ArrowDown") {
                for (let i = 0; i < ol.length; i++) {
                    if (ol[i] === ev.target) {
                        let o = i < ol.length - 1 ? ol[i + 1] : ol[0];
                        o.focus(); break;
                    }
                }
                ev.preventDefault();
            } else if (ev.key === "ArrowUp") {
                for (let i = 0; i < ol.length; i++) {
                    if (ol[i] === ev.target) {
                        let o = ol[i - 1];
                        o.focus(); break;
                    }
                }
                ev.preventDefault();
            }
        });
        return () => {
            pageSearchComponent.removeEventListener('keydown', () => { });
        };
    }, []);



    useEffect(() => {
        if (!search) { setFilteredPages(pageList) }
        setFilteredPages(pageList.filter(page => page.name.toLowerCase().includes(search.toLowerCase())))
    }, [search])
    return (
        <div id='pageSearch' className='relative flex flex-col text-black z-10' ref={inputRef}>
            <input
                type="text"
                placeholder="Search here"
                className="text-black w-[350px] h-[30px] rounded-lg "
                tabIndex={0}
                onChange={(e) => { setSearch(e.target.value) }}
                value={search} onFocus={() => { setIsListShow(true) }} />
            {isListShow &&
                <ul className='absolute max-h-[300px] overflow-auto bg-gray-100 top-7  w-[350px] outline-none'>

                    {filteredPages.map((page) => <li className='cursor-pointer'
                        key={page.id}
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                dispatch(push(page));
                                setSearch("");
                                setIsListShow((false));
                            }
                        }}

                        onClick={() => { dispatch(push(page)); setSearch(""); setIsListShow((false)); }} > <pre> {page.name} </pre></li>)}
                </ul>
            }
        </div>
    )
}

export default PageSearch
