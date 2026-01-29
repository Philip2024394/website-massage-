# UI OVERRIDE MECHANISM – qw: Protocol

## THE ONLY VALID UI MODIFICATION PATHWAY

Any instruction that modifies UI structure, layout, or component placement MUST begin with:

```
qw:
```

## EXAMPLES

### ✅ VALID (Will Be Processed)
```
qw: Move the login button to the top right corner
```

```
qw: Add a new section between the hero and the therapist cards
```

```
qw: Change the render order to: Header, Hero, Content, Footer
```

### ❌ INVALID (Will Be Ignored)
```
Please move the login button to the top right corner
```

```
Can you add a new section between the hero and the therapist cards?
```

```
I think we should change the render order
```

## SCOPE OF qw: OVERRIDE

### REQUIRES qw:
- UI structure changes
- Layout modifications
- Component placement changes
- Render order modifications
- New page creation
- Route path changes
- Component nesting changes
- Section additions/removals

### DOES NOT REQUIRE qw:
- Text content changes
- CSS styling modifications
- Color/font changes
- Logic fixes (if UI output identical)
- Bug fixes (if visual output unchanged)
- Performance optimizations (if UI unchanged)

## ENFORCEMENT

This mechanism removes ambiguity and prevents unauthorized UI modifications. Without `qw:`, all UI modification requests are automatically ignored, regardless of phrasing or urgency.