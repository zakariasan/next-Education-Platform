"use client";

import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Search } from 'lucide-react';

import React from "react";

const SearchBar = ({ onSearch }: { onSearch: (value: string) => void }) => {
  const [value, setValue] = useState("");

  return ( <div className=" flex items-center w-full  max-w-md rounded border border-gray-300 shadow-sm  focus-within:ring-2 focus-within:ring-gray-500 focus-within:border-gray-500 transition ">
        <Search  className="mx-2 h-4 w-4 text-gray-500" />

      <Input
        type="search"
        placeholder="Search..."
        value={value}
        onChange={(e) => {
          setValue(e.target.value)
          onSearch(e.target.value)
        }}

        className="py-6 "
      />
    </div>);
};

export default SearchBar;
