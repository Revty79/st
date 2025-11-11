# Testing the Data Cascade System

## Quick Test Guide

### Prerequisites
- Dev server running: `npm run dev`
- Navigate to: `http://localhost:3000/worldbuilder/settings/settingdetails?settingId=3&eraId=9&worldId=3`

### Test 1: Front Matter Region Selection

**Expected Behavior:**
1. Open **Front Matter** tab
2. Look for **Region/Kingdom** dropdown (below Summary field)
3. Should show options like:
   - "Northern Provinces (Valerian Empire)"
   - "Coastal Territories (Valerian Empire)"
   - "Ironhaven (Valerian Empire)"
   - "Oasis Kingdoms (Desert Caliphate)"
   - "Sand Wastes (Desert Caliphate)"

4. Select "Northern Provinces (Valerian Empire)"
5. Should see: **"✓ Part of Valerian Empire"** below dropdown

**What This Tests:**
- ✅ Era governments load correctly
- ✅ Regions populate dropdown
- ✅ Format shows both region and government
- ✅ Selection stores both fields

---

### Test 2: Geography Cascade Context

**Expected Behavior:**
1. With region selected in Front Matter
2. Navigate to **Geography** tab
3. Should see blue **"📍 Geography Context"** panel at top with:
   ```
   Continent: Aurelia (Verdant and temperate)
   Region: Northern Provinces
   
   🏔️ 3 Mountains    〰️ 3 Rivers
   🌊 3 Lakes         🏖️ 3 Coasts
   🛤️ 3 Trade Routes  💎 3 Resources
   ```

**What This Tests:**
- ✅ Data resolver traces Region → Government → Continent
- ✅ Continent data fetches from World
- ✅ Context panel displays correctly

---

### Test 3: Quick-Adopt Resources & Hazards

**Expected Behavior:**
1. On Geography tab, look for green **"🌍 Adopt from Aurelia"** panel
2. Should show:
   - **💎 Resources**: "Iron Deposits", "Ancient Oak Forests", "Silver Mines"
   - **⚠️ Hazards**: "Bandit Territories", "Wildfire Zones", "Cursed Marshlands"

3. Click **"+ Iron Deposits"**
4. Button changes to: **"✓ Iron Deposits"** (disabled)
5. Scroll down to **Resources & Hazards Pairs** section
6. Should see new pair with Resource = "Iron Deposits", Hazard = "" (empty, ready to fill)

7. Go back up, click **"+ Wildfire Zones"** (hazard)
8. Should see new pair with Resource = "", Hazard = "Wildfire Zones"

**What This Tests:**
- ✅ Continent resources load
- ✅ Continent hazards load
- ✅ One-click adoption works
- ✅ Duplicate prevention works
- ✅ Pairs populate in form

---

### Test 4: Signature Features Adoption

**Expected Behavior:**
1. Still on Geography tab, scroll to **Signature Features** section
2. Should see **"📍 Available from Aethermoor/Age of Steel"** panel
3. Features grouped by category with emojis:
   - 🏔️ Ironspine Mountains, Frostpeak Range, Skyreach Peaks
   - 🌊 Lake Mirrowen, Silvermere, The Deepwell
   - 〰️ River Vey, Serpent's Run, Goldstream
   - 🛤️ Old Imperial Road, Silkway Caravan Route, Merchant's March
   - 🏖️ Sunset Coast, Bay of Storms, Merchant's Harbor

4. Click **"🏔️ Ironspine Mountains"**
5. Should appear in Signature Features field below
6. Button becomes disabled

**What This Tests:**
- ✅ All continent geography types available
- ✅ Feature adoption works
- ✅ Max 5 features enforced

---

### Test 5: Change Region (Cascade Update)

**Expected Behavior:**
1. Go back to **Front Matter** tab
2. Change Region dropdown from "Northern Provinces" to **"Oasis Kingdoms (Desert Caliphate)"**
3. Should see: **"✓ Part of Desert Caliphate"**

4. Navigate back to **Geography** tab
5. Context panel should now show:
   ```
   Continent: Valtor (Arid and windswept)
   Region: Oasis Kingdoms
   
   🏔️ 2 Mountains    〰️ 2 Rivers
   🌊 1 Lakes         🏖️ 1 Coasts
   🛤️ 2 Trade Routes  💎  3 Resources
   ```

6. Quick-Adopt panel should show Valtor resources/hazards:
   - **💎 Resources**: "Sandglass Deposits", "Date Palms", "Spice Gardens"
   - **⚠️ Hazards**: "Sandstorms", "Desert Raiders", "Mirage Traps"

7. Signature Features should show Valtor geography:
   - 🏔️ Sunscorch Peaks, Dragonspine Range
   - 〰️ Drywater Creek, Oasis Run
   - 🌊 Mirage Lake
   - etc.

**What This Tests:**
- ✅ Region change triggers cascade update
- ✅ Resolver updates continent correctly
- ✅ All panels re-render with new data
- ✅ No stale data displayed

---

### Test 6: No Region Selected (Fallback)

**Expected Behavior:**
1. Go to Front Matter, clear region selection (if possible) or create new Setting
2. Navigate to Geography tab
3. Context panel should show:
   ```
   ⚠️ Select a Region in Front Matter to inherit continent geography
   ```
4. No Quick-Adopt panel displayed
5. Signature Features shows empty or fallback options

**What This Tests:**
- ✅ Graceful degradation when no region selected
- ✅ Clear user guidance
- ✅ No crashes with null continent

---

## Test Continents Available

### Aurelia (Temperate - Valerian Empire)
- **Mountains**: Ironspine, Frostpeak, Skyreach
- **Rivers**: Vey, Serpent's Run, Goldstream
- **Lakes**: Mirrowen, Silvermere, Deepwell
- **Trade**: Imperial Road, Silkway, Merchant's March
- **Resources**: Iron, Oak Forests, Silver
- **Hazards**: Bandits, Wildfires, Cursed Marshlands

### Valtor (Arid - Desert Caliphate)
- **Mountains**: Sunscorch Peaks, Dragonspine
- **Rivers**: Drywater Creek, Oasis Run
- **Lakes**: Mirage Lake
- **Trade**: Sand Road, Oasis Trail
- **Resources**: Sandglass, Date Palms, Spices
- **Hazards**: Sandstorms, Desert Raiders, Mirages

### Zenithia (Frozen - No government yet)
- **Mountains**: World's Crown, Everfrost, Glacier Teeth
- **Rivers**: Frozen Flow, Meltwater Rush
- **Lakes**: Crystal Lake, Icebound Deep
- **Trade**: Northern Pass, Frost Trail
- **Resources**: Permafrost Minerals, Whale Oil, Ice Crystals
- **Hazards**: Avalanches, Blizzards, Ice Giants

### Borealis (Tropical - No government yet)
- **Mountains**: Emerald Peaks, Thunder Ridge
- **Rivers**: Jade River, Rainbow Falls, Python's Coil
- **Lakes**: Lotus Lake, Singing Waters
- **Trade**: Jungle Road, Coastal Route, River Trade
- **Resources**: Tropical Hardwoods, Exotic Spices, Pearl Beds
- **Hazards**: Monsoon Floods, Jungle Fever, Predator Territories

---

## Common Issues & Solutions

### Issue: No regions in dropdown
**Cause**: Era governments have no regions defined
**Solution**: Go to Era Details → Governments tab → Add regions to governments

### Issue: Context panel shows wrong continent
**Cause**: Government continent assignment incorrect
**Solution**: Go to Era Details → Governments tab → Check continent dropdown (first field)

### Issue: Features not appearing
**Cause**: World continents not populated with geography
**Solution**: Go to World Details → Planet Profile tab → Add geography to continents

### Issue: Adopted features disappear
**Cause**: Not saving after adoption
**Solution**: Navigation triggers auto-save; or click "💾 Save Changes" button

---

## Success Criteria

**All tests pass when:**
- ✅ Region dropdown populates from Era
- ✅ Selecting region shows confirmation
- ✅ Geography context panel shows correct continent
- ✅ Resources/hazards adopt with one click
- ✅ Signature features populate from continent
- ✅ Changing region updates all cascade data
- ✅ No region selected shows helpful warning
- ✅ No console errors
- ✅ No runtime crashes

**If any test fails:**
1. Check browser console for errors
2. Verify mock data structure in `settingdetails/page.tsx`
3. Verify form props in same file
4. Check component interfaces match expected data shape
5. Review cascade resolver logic

---

## Next Steps After Testing

1. **Document any bugs** found during testing
2. **Fix critical issues** (crashes, data corruption)
3. **Move to next form**: BuiltEnvironmentForm cascade
4. **Repeat testing** for each new form
5. **Integration test**: Complete flow with all 8 MVS forms
