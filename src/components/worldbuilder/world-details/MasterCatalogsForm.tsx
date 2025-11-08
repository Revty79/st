"use client";

import { useState } from "react";

// Reusable UI components
const Input = ({ value, onCommit, placeholder, className, maxLength }: {
  value: string;
  onCommit: (value: string) => void;
  placeholder?: string;
  className?: string;
  maxLength?: number;
}) => {
  const [raw, setRaw] = useState(value || "");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRaw(e.target.value);
  };

  const handleBlur = () => {
    onCommit(raw);
  };

  return (
    <input
      type="text"
      value={raw}
      onChange={handleChange}
      onBlur={handleBlur}
      placeholder={placeholder}
      maxLength={maxLength}
      className={`w-full rounded-lg bg-white/10 text-white placeholder:text-zinc-300 border border-white/20 px-3 py-2 outline-none focus:ring-2 focus:ring-amber-400 ${className || ""}`}
    />
  );
};

const Textarea = ({ value, onCommit, placeholder, className, maxLength }: {
  value: string;
  onCommit: (value: string) => void;
  placeholder?: string;
  className?: string;
  maxLength?: number;
}) => {
  const [raw, setRaw] = useState(value || "");
  const [charCount, setCharCount] = useState(raw.length);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setRaw(newValue);
    setCharCount(newValue.length);
  };

  const handleBlur = () => {
    onCommit(raw);
  };

  return (
    <div className="relative">
      <textarea
        value={raw}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        maxLength={maxLength}
        className={`w-full rounded-lg bg-white/10 text-white placeholder:text-zinc-300 border border-white/20 px-3 py-2 outline-none focus:ring-2 focus:ring-amber-400 resize-y ${className || ""}`}
        rows={3}
      />
      {maxLength && (
        <div className="text-sm text-zinc-200 mt-1 text-right">
          {charCount}/{maxLength}
        </div>
      )}
    </div>
  );
};

const TagInput = ({ values, onCommit, placeholder, maxTags, maxLength }: {
  values: string[];
  onCommit: (values: string[]) => void;
  placeholder?: string;
  maxTags?: number;
  maxLength?: number;
}) => {
  const [inputValue, setInputValue] = useState("");

  const addTag = (tag: string) => {
    if (tag.trim() && !values.includes(tag.trim())) {
      if (!maxTags || values.length < maxTags) {
        onCommit([...values, tag.trim()]);
        setInputValue("");
      }
    }
  };

  const removeTag = (indexToRemove: number) => {
    onCommit(values.filter((_, index) => index !== indexToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === "Backspace" && inputValue === "" && values.length > 0) {
      removeTag(values.length - 1);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1">
        {values.map((tag, index) => (
          <span
            key={index}
            className="inline-flex items-center px-2 py-1 bg-amber-500 text-black text-sm rounded-full"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(index)}
              className="ml-1 text-amber-800 hover:text-black"
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={maxTags && values.length >= maxTags ? `Max ${maxTags} tags reached` : placeholder}
        disabled={!!(maxTags && values.length >= maxTags)}
        maxLength={maxLength}
        className={`w-full rounded-lg bg-white/10 text-white placeholder:text-zinc-300 border border-white/20 px-3 py-2 outline-none focus:ring-2 focus:ring-amber-400 ${
          !!(maxTags && values.length >= maxTags) ? "opacity-50" : ""
        }`}
      />
      {maxTags && (
        <div className="text-xs text-zinc-200">
          {values.length}/{maxTags} tags
        </div>
      )}
    </div>
  );
};

// Data interfaces
export interface LanguageFamilyData {
  name: string;
  description: string;
  languages: string[];
  writingSystem: string;
  speakers: string;
  status: string;
}

export interface CurrencySystemData {
  name: string;
  type: string;
  denominations: string[];
  exchangeRates: string;
  regions: string[];
  backing: string;
  notes: string;
}

export interface OrganizationData {
  name: string;
  type: string;
  scope: string;
  alignment: string;
  goals: string;
  structure: string;
  membership: string;
  resources: string;
  reputation: string;
  rivals: string[];
  allies: string[];
}

export interface CommonItemData {
  name: string;
  category: string;
  rarity: string;
  value: string;
  description: string;
  availability: string;
  regions: string[];
  uses: string[];
}

export interface MasterCatalogsData {
  languageFamilies: LanguageFamilyData[];
  currencySystems: CurrencySystemData[];
  organizations: OrganizationData[];
  commonItems: CommonItemData[];
  organizationTypes: string[];
  itemCategories: string[];
  rarityLevels: string[];
  notes: string;
}

interface MasterCatalogsFormProps {
  data: MasterCatalogsData;
  onUpdate: (data: Partial<MasterCatalogsData>) => void;
}

export default function MasterCatalogsForm({ data, onUpdate }: MasterCatalogsFormProps) {
  const languageStatusOptions = [
    { value: "", label: "Select status..." },
    { value: "Thriving", label: "Thriving" },
    { value: "Common", label: "Common" },
    { value: "Regional", label: "Regional" },
    { value: "Declining", label: "Declining" },
    { value: "Endangered", label: "Endangered" },
    { value: "Dead", label: "Dead/Ancient" },
    { value: "Sacred", label: "Sacred/Liturgical" },
    { value: "Trade", label: "Trade Language" },
    { value: "Secret", label: "Secret/Coded" }
  ];

  const currencyTypeOptions = [
    { value: "", label: "Select type..." },
    { value: "Metal Coins", label: "Metal Coins" },
    { value: "Paper Money", label: "Paper Money" },
    { value: "Commodity", label: "Commodity Currency" },
    { value: "Barter", label: "Barter System" },
    { value: "Credit", label: "Credit/Banking" },
    { value: "Magical", label: "Magical Currency" },
    { value: "Service", label: "Service-based" },
    { value: "Mixed", label: "Mixed System" }
  ];

  const organizationScopeOptions = [
    { value: "", label: "Select scope..." },
    { value: "Local", label: "Local" },
    { value: "Regional", label: "Regional" },
    { value: "National", label: "National" },
    { value: "International", label: "International" },
    { value: "Continental", label: "Continental" },
    { value: "Global", label: "Global" },
    { value: "Planar", label: "Planar" },
    { value: "Cosmic", label: "Cosmic" }
  ];

  const alignmentOptions = [
    { value: "", label: "Select alignment..." },
    { value: "Lawful Good", label: "Lawful Good" },
    { value: "Neutral Good", label: "Neutral Good" },
    { value: "Chaotic Good", label: "Chaotic Good" },
    { value: "Lawful Neutral", label: "Lawful Neutral" },
    { value: "True Neutral", label: "True Neutral" },
    { value: "Chaotic Neutral", label: "Chaotic Neutral" },
    { value: "Lawful Evil", label: "Lawful Evil" },
    { value: "Neutral Evil", label: "Neutral Evil" },
    { value: "Chaotic Evil", label: "Chaotic Evil" },
    { value: "Unaligned", label: "Unaligned" },
    { value: "Variable", label: "Variable" }
  ];

  const defaultOrgTypes = [
    "Guild", "Religious Order", "Military", "Trading Company", "Academic", "Government",
    "Criminal", "Mercenary", "Exploration", "Magical Society", "Secret Society", "Cult"
  ];

  const defaultItemCategories = [
    "Weapons", "Armor", "Tools", "Consumables", "Materials", "Art Objects",
    "Books", "Clothing", "Jewelry", "Transportation", "Containers", "Musical Instruments"
  ];

  const defaultRarityLevels = [
    "Ubiquitous", "Common", "Uncommon", "Rare", "Very Rare", "Legendary", "Artifact"
  ];

  // Helper functions for Language Families
  const addLanguageFamily = () => {
    const newFamilies = [...data.languageFamilies, {
      name: "", description: "", languages: [], writingSystem: "",
      speakers: "", status: ""
    }];
    onUpdate({ languageFamilies: newFamilies });
  };

  const removeLanguageFamily = (index: number) => {
    const newFamilies = data.languageFamilies.filter((_, i) => i !== index);
    onUpdate({ languageFamilies: newFamilies });
  };

  const updateLanguageFamily = (index: number, updates: Partial<LanguageFamilyData>) => {
    const newFamilies = data.languageFamilies.map((family, i) =>
      i === index ? { ...family, ...updates } : family
    );
    onUpdate({ languageFamilies: newFamilies });
  };

  // Helper functions for Currency Systems
  const addCurrencySystem = () => {
    const newCurrencies = [...data.currencySystems, {
      name: "", type: "", denominations: [], exchangeRates: "",
      regions: [], backing: "", notes: ""
    }];
    onUpdate({ currencySystems: newCurrencies });
  };

  const removeCurrencySystem = (index: number) => {
    const newCurrencies = data.currencySystems.filter((_, i) => i !== index);
    onUpdate({ currencySystems: newCurrencies });
  };

  const updateCurrencySystem = (index: number, updates: Partial<CurrencySystemData>) => {
    const newCurrencies = data.currencySystems.map((currency, i) =>
      i === index ? { ...currency, ...updates } : currency
    );
    onUpdate({ currencySystems: newCurrencies });
  };

  // Helper functions for Organizations
  const addOrganization = () => {
    const newOrgs = [...data.organizations, {
      name: "", type: "", scope: "", alignment: "", goals: "",
      structure: "", membership: "", resources: "", reputation: "",
      rivals: [], allies: []
    }];
    onUpdate({ organizations: newOrgs });
  };

  const removeOrganization = (index: number) => {
    const newOrgs = data.organizations.filter((_, i) => i !== index);
    onUpdate({ organizations: newOrgs });
  };

  const updateOrganization = (index: number, updates: Partial<OrganizationData>) => {
    const newOrgs = data.organizations.map((org, i) =>
      i === index ? { ...org, ...updates } : org
    );
    onUpdate({ organizations: newOrgs });
  };

  // Helper functions for Common Items
  const addCommonItem = () => {
    const newItems = [...data.commonItems, {
      name: "", category: "", rarity: "", value: "", description: "",
      availability: "", regions: [], uses: []
    }];
    onUpdate({ commonItems: newItems });
  };

  const removeCommonItem = (index: number) => {
    const newItems = data.commonItems.filter((_, i) => i !== index);
    onUpdate({ commonItems: newItems });
  };

  const updateCommonItem = (index: number, updates: Partial<CommonItemData>) => {
    const newItems = data.commonItems.map((item, i) =>
      i === index ? { ...item, ...updates } : item
    );
    onUpdate({ commonItems: newItems });
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-white/20 pb-4">
        <h2 className="text-xl font-semibold text-white">Master Catalogs — Player Lore; G.O.D Framework</h2>
        <p className="text-sm text-zinc-200 mt-1">
          Comprehensive catalogs of languages, currencies, organizations, and common items in your world.
        </p>
      </div>

      <div className="space-y-8">
        {/* Custom Categories Management */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Organization Types
            </label>
            <p className="text-xs text-zinc-200 mb-2">
              Types of organizations in your world.
            </p>
            <TagInput
              values={data.organizationTypes.length > 0 ? data.organizationTypes : defaultOrgTypes}
              onCommit={(values) => onUpdate({ organizationTypes: values })}
              placeholder="Add organization type..."
              maxLength={30}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Item Categories
            </label>
            <p className="text-xs text-zinc-200 mb-2">
              Categories for common items.
            </p>
            <TagInput
              values={data.itemCategories.length > 0 ? data.itemCategories : defaultItemCategories}
              onCommit={(values) => onUpdate({ itemCategories: values })}
              placeholder="Add item category..."
              maxLength={30}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Rarity Levels
            </label>
            <p className="text-xs text-zinc-200 mb-2">
              Rarity classifications for items.
            </p>
            <TagInput
              values={data.rarityLevels.length > 0 ? data.rarityLevels : defaultRarityLevels}
              onCommit={(values) => onUpdate({ rarityLevels: values })}
              placeholder="Add rarity level..."
              maxLength={20}
            />
          </div>
        </div>

        {/* Language Families */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-white">
              Language Families
            </label>
            <button
              type="button"
              onClick={addLanguageFamily}
              className="px-3 py-1 bg-amber-500 text-black text-sm rounded hover:bg-amber-400"
            >
              Add Language Family
            </button>
          </div>
          <p className="text-xs text-zinc-200 mb-4">
            Linguistic groups and individual languages in your world.
          </p>

          <div className="space-y-4">
            {data.languageFamilies.map((family, index) => (
              <div key={index} className="border border-white/20 rounded-lg p-4 bg-white/5">
                <div className="flex justify-between items-start mb-4">
                  <h4 className="text-sm font-medium text-white">
                    {family.name || `Language Family ${index + 1}`}
                  </h4>
                  <button
                    type="button"
                    onClick={() => removeLanguageFamily(index)}
                    className="text-red-400 hover:text-red-300"
                  >
                    Remove
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-zinc-200 mb-1">
                      Family Name
                    </label>
                    <Input
                      value={family.name}
                      onCommit={(value) => updateLanguageFamily(index, { name: value })}
                      placeholder="Family name..."
                      maxLength={60}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-200 mb-1">
                      Writing System
                    </label>
                    <Input
                      value={family.writingSystem}
                      onCommit={(value) => updateLanguageFamily(index, { writingSystem: value })}
                      placeholder="Alphabetic, logographic, etc..."
                      maxLength={50}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-200 mb-1">
                      Status
                    </label>
                    <select
                      value={family.status}
                      onChange={(e) => updateLanguageFamily(index, { status: e.target.value })}
                      className="w-full rounded-lg bg-white/10 text-white border border-white/20 px-3 py-2 outline-none focus:ring-2 focus:ring-amber-400"
                    >
                      {languageStatusOptions.map((option) => (
                        <option key={option.value} value={option.value} className="bg-zinc-800 text-white">
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2 lg:col-span-3">
                    <label className="block text-xs font-medium text-zinc-200 mb-1">
                      Description
                    </label>
                    <Textarea
                      value={family.description}
                      onCommit={(value) => updateLanguageFamily(index, { description: value })}
                      placeholder="Describe this language family..."
                      maxLength={300}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-200 mb-1">
                      Languages
                    </label>
                    <TagInput
                      values={family.languages}
                      onCommit={(values) => updateLanguageFamily(index, { languages: values })}
                      placeholder="Add language..."
                      maxLength={40}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-200 mb-1">
                      Speakers
                    </label>
                    <Input
                      value={family.speakers}
                      onCommit={(value) => updateLanguageFamily(index, { speakers: value })}
                      placeholder="Who speaks these languages..."
                      maxLength={100}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Currency Systems */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-white">
              Currency Systems
            </label>
            <button
              type="button"
              onClick={addCurrencySystem}
              className="px-3 py-1 bg-amber-500 text-black text-sm rounded hover:bg-amber-400"
            >
              Add Currency System
            </button>
          </div>
          <p className="text-xs text-zinc-200 mb-4">
            Monetary systems and trade mechanisms in your world.
          </p>

          <div className="space-y-4">
            {data.currencySystems.map((currency, index) => (
              <div key={index} className="border border-white/20 rounded-lg p-4 bg-white/5">
                <div className="flex justify-between items-start mb-4">
                  <h4 className="text-sm font-medium text-white">
                    {currency.name || `Currency System ${index + 1}`}
                  </h4>
                  <button
                    type="button"
                    onClick={() => removeCurrencySystem(index)}
                    className="text-red-400 hover:text-red-300"
                  >
                    Remove
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-zinc-200 mb-1">
                      Currency Name
                    </label>
                    <Input
                      value={currency.name}
                      onCommit={(value) => updateCurrencySystem(index, { name: value })}
                      placeholder="Currency name..."
                      maxLength={50}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-200 mb-1">
                      Type
                    </label>
                    <select
                      value={currency.type}
                      onChange={(e) => updateCurrencySystem(index, { type: e.target.value })}
                      className="w-full rounded-lg bg-white/10 text-white border border-white/20 px-3 py-2 outline-none focus:ring-2 focus:ring-amber-400"
                    >
                      {currencyTypeOptions.map((option) => (
                        <option key={option.value} value={option.value} className="bg-zinc-800 text-white">
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-200 mb-1">
                      Backing
                    </label>
                    <Input
                      value={currency.backing}
                      onCommit={(value) => updateCurrencySystem(index, { backing: value })}
                      placeholder="Gold standard, government, etc..."
                      maxLength={60}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-200 mb-1">
                      Denominations
                    </label>
                    <TagInput
                      values={currency.denominations}
                      onCommit={(values) => updateCurrencySystem(index, { denominations: values })}
                      placeholder="Add denomination..."
                      maxLength={30}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-200 mb-1">
                      Regions Used
                    </label>
                    <TagInput
                      values={currency.regions}
                      onCommit={(values) => updateCurrencySystem(index, { regions: values })}
                      placeholder="Add region..."
                      maxLength={40}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-200 mb-1">
                      Exchange Rates
                    </label>
                    <Input
                      value={currency.exchangeRates}
                      onCommit={(value) => updateCurrencySystem(index, { exchangeRates: value })}
                      placeholder="1 gold = 10 silver..."
                      maxLength={100}
                    />
                  </div>

                  <div className="md:col-span-2 lg:col-span-3">
                    <label className="block text-xs font-medium text-zinc-200 mb-1">
                      Notes
                    </label>
                    <Textarea
                      value={currency.notes}
                      onCommit={(value) => updateCurrencySystem(index, { notes: value })}
                      placeholder="Additional details about this currency..."
                      maxLength={300}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Organizations */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-white">
              Organizations & Factions
            </label>
            <button
              type="button"
              onClick={addOrganization}
              className="px-3 py-1 bg-amber-500 text-black text-sm rounded hover:bg-amber-400"
            >
              Add Organization
            </button>
          </div>
          <p className="text-xs text-zinc-200 mb-4">
            Important organizations, guilds, and factions in your world.
          </p>

          <div className="space-y-4">
            {data.organizations.map((org, index) => (
              <div key={index} className="border border-white/20 rounded-lg p-4 bg-white/5">
                <div className="flex justify-between items-start mb-4">
                  <h4 className="text-sm font-medium text-white">
                    {org.name || `Organization ${index + 1}`}
                  </h4>
                  <button
                    type="button"
                    onClick={() => removeOrganization(index)}
                    className="text-red-400 hover:text-red-300"
                  >
                    Remove
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-zinc-200 mb-1">
                      Name
                    </label>
                    <Input
                      value={org.name}
                      onCommit={(value) => updateOrganization(index, { name: value })}
                      placeholder="Organization name..."
                      maxLength={60}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-200 mb-1">
                      Type
                    </label>
                    <select
                      value={org.type}
                      onChange={(e) => updateOrganization(index, { type: e.target.value })}
                      className="w-full rounded-lg bg-white/10 text-white border border-white/20 px-3 py-2 outline-none focus:ring-2 focus:ring-amber-400"
                    >
                      <option value="" className="bg-zinc-800 text-white">Select type...</option>
                      {(data.organizationTypes.length > 0 ? data.organizationTypes : defaultOrgTypes).map((type) => (
                        <option key={type} value={type} className="bg-zinc-800 text-white">
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-200 mb-1">
                      Scope
                    </label>
                    <select
                      value={org.scope}
                      onChange={(e) => updateOrganization(index, { scope: e.target.value })}
                      className="w-full rounded-lg bg-white/10 text-white border border-white/20 px-3 py-2 outline-none focus:ring-2 focus:ring-amber-400"
                    >
                      {organizationScopeOptions.map((option) => (
                        <option key={option.value} value={option.value} className="bg-zinc-800 text-white">
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-200 mb-1">
                      Alignment
                    </label>
                    <select
                      value={org.alignment}
                      onChange={(e) => updateOrganization(index, { alignment: e.target.value })}
                      className="w-full rounded-lg bg-white/10 text-white border border-white/20 px-3 py-2 outline-none focus:ring-2 focus:ring-amber-400"
                    >
                      {alignmentOptions.map((option) => (
                        <option key={option.value} value={option.value} className="bg-zinc-800 text-white">
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2 lg:col-span-2">
                    <label className="block text-xs font-medium text-zinc-200 mb-1">
                      Goals
                    </label>
                    <Textarea
                      value={org.goals}
                      onCommit={(value) => updateOrganization(index, { goals: value })}
                      placeholder="What does this organization want to achieve..."
                      maxLength={200}
                    />
                  </div>

                  <div className="md:col-span-2 lg:col-span-2">
                    <label className="block text-xs font-medium text-zinc-200 mb-1">
                      Structure
                    </label>
                    <Textarea
                      value={org.structure}
                      onCommit={(value) => updateOrganization(index, { structure: value })}
                      placeholder="How is the organization structured..."
                      maxLength={200}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-zinc-200 mb-1">
                      Membership
                    </label>
                    <Textarea
                      value={org.membership}
                      onCommit={(value) => updateOrganization(index, { membership: value })}
                      placeholder="Who can join and how..."
                      maxLength={150}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-zinc-200 mb-1">
                      Resources
                    </label>
                    <Textarea
                      value={org.resources}
                      onCommit={(value) => updateOrganization(index, { resources: value })}
                      placeholder="Funding, equipment, connections..."
                      maxLength={150}
                    />
                  </div>

                  <div className="md:col-span-2 lg:col-span-2">
                    <label className="block text-xs font-medium text-zinc-200 mb-1">
                      Reputation
                    </label>
                    <Textarea
                      value={org.reputation}
                      onCommit={(value) => updateOrganization(index, { reputation: value })}
                      placeholder="How is this organization viewed..."
                      maxLength={200}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-200 mb-1">
                      Rivals
                    </label>
                    <TagInput
                      values={org.rivals}
                      onCommit={(values) => updateOrganization(index, { rivals: values })}
                      placeholder="Add rival organization..."
                      maxLength={50}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-200 mb-1">
                      Allies
                    </label>
                    <TagInput
                      values={org.allies}
                      onCommit={(values) => updateOrganization(index, { allies: values })}
                      placeholder="Add allied organization..."
                      maxLength={50}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Common Items */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-white">
              Common Items & Trade Goods
            </label>
            <button
              type="button"
              onClick={addCommonItem}
              className="px-3 py-1 bg-amber-500 text-black text-sm rounded hover:bg-amber-400"
            >
              Add Item
            </button>
          </div>
          <p className="text-xs text-zinc-200 mb-4">
            Everyday items, trade goods, and commonly available equipment.
          </p>

          <div className="space-y-4">
            {data.commonItems.map((item, index) => (
              <div key={index} className="border border-white/20 rounded-lg p-4 bg-white/5">
                <div className="flex justify-between items-start mb-4">
                  <h4 className="text-sm font-medium text-white">
                    {item.name || `Item ${index + 1}`}
                  </h4>
                  <button
                    type="button"
                    onClick={() => removeCommonItem(index)}
                    className="text-red-400 hover:text-red-300"
                  >
                    Remove
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-zinc-200 mb-1">
                      Item Name
                    </label>
                    <Input
                      value={item.name}
                      onCommit={(value) => updateCommonItem(index, { name: value })}
                      placeholder="Item name..."
                      maxLength={60}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-200 mb-1">
                      Category
                    </label>
                    <select
                      value={item.category}
                      onChange={(e) => updateCommonItem(index, { category: e.target.value })}
                      className="w-full rounded-lg bg-white/10 text-white border border-white/20 px-3 py-2 outline-none focus:ring-2 focus:ring-amber-400"
                    >
                      <option value="" className="bg-zinc-800 text-white">Select category...</option>
                      {(data.itemCategories.length > 0 ? data.itemCategories : defaultItemCategories).map((category) => (
                        <option key={category} value={category} className="bg-zinc-800 text-white">
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-200 mb-1">
                      Rarity
                    </label>
                    <select
                      value={item.rarity}
                      onChange={(e) => updateCommonItem(index, { rarity: e.target.value })}
                      className="w-full rounded-lg bg-white/10 text-white border border-white/20 px-3 py-2 outline-none focus:ring-2 focus:ring-amber-400"
                    >
                      <option value="" className="bg-zinc-800 text-white">Select rarity...</option>
                      {(data.rarityLevels.length > 0 ? data.rarityLevels : defaultRarityLevels).map((rarity) => (
                        <option key={rarity} value={rarity} className="bg-zinc-800 text-white">
                          {rarity}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-200 mb-1">
                      Value
                    </label>
                    <Input
                      value={item.value}
                      onCommit={(value) => updateCommonItem(index, { value: value })}
                      placeholder="5 gold pieces..."
                      maxLength={50}
                    />
                  </div>

                  <div className="md:col-span-2 lg:col-span-2">
                    <label className="block text-xs font-medium text-zinc-200 mb-1">
                      Description
                    </label>
                    <Textarea
                      value={item.description}
                      onCommit={(value) => updateCommonItem(index, { description: value })}
                      placeholder="Describe this item..."
                      maxLength={200}
                    />
                  </div>

                  <div className="md:col-span-2 lg:col-span-2">
                    <label className="block text-xs font-medium text-zinc-200 mb-1">
                      Availability
                    </label>
                    <Textarea
                      value={item.availability}
                      onCommit={(value) => updateCommonItem(index, { availability: value })}
                      placeholder="Where and how easily can this be found..."
                      maxLength={150}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-200 mb-1">
                      Regions
                    </label>
                    <TagInput
                      values={item.regions}
                      onCommit={(values) => updateCommonItem(index, { regions: values })}
                      placeholder="Add region..."
                      maxLength={40}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-200 mb-1">
                      Uses
                    </label>
                    <TagInput
                      values={item.uses}
                      onCommit={(values) => updateCommonItem(index, { uses: values })}
                      placeholder="Add use..."
                      maxLength={30}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Notes */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Additional Catalog Notes
          </label>
          <p className="text-xs text-zinc-200 mb-2">
            Any other important information about your world's catalogs and systems.
          </p>
          <Textarea
            value={data.notes}
            onCommit={(value) => onUpdate({ notes: value })}
            placeholder="Trade relationships, cultural significance of items, linguistic evolution..."
            maxLength={800}
            className="min-h-[120px]"
          />
        </div>
      </div>
    </div>
  );
}