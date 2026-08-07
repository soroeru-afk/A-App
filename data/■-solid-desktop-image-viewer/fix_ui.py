import re

with open("src/components/ui.tsx", "r") as f:
    ui = f.read()

# Make SolidButton snappier by replacing whileTap={{ scale: 0.98, y: 1 }} with whileTap={{ scale: 0.96 }}
# and setting transition to duration 0.05
# Also remove transition-colors so the color change is immediate.
old_solid_button = """export const SolidButton = React.forwardRef<HTMLButtonElement, SolidButtonProps>(
  ({ className, active, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.98, y: 1 }}
        className={cn(
          "relative px-4 py-2 text-xs font-mono tracking-wider uppercase flex items-center justify-center gap-2 transition-colors",
          "border outline-none rounded-none shadow-[0_2px_4px_rgba(0,0,0,0.2)]",
          active 
            ? "bg-btn-active-bg border-btn-active-border border-b-btn-active-border-b border-r-btn-active-border-r text-btn-active-text" 
            : "bg-btn-bg border-btn-border border-b-btn-border-b border-r-btn-border-r text-btn-text hover:text-btn-hover-text hover:bg-btn-hover-bg hover:border-t-btn-hover-border-t",
          className
        )}
        {...props}
      />
    );
  }
);"""

new_solid_button = """export const SolidButton = React.forwardRef<HTMLButtonElement, SolidButtonProps>(
  ({ className, active, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.96 }}
        transition={{ duration: 0.05 }}
        className={cn(
          "relative px-4 py-2 text-xs font-mono tracking-wider uppercase flex items-center justify-center gap-2",
          "border outline-none rounded-none shadow-[0_2px_4px_rgba(0,0,0,0.2)]",
          active 
            ? "bg-btn-active-bg border-btn-active-border border-b-btn-active-border-b border-r-btn-active-border-r text-btn-active-text" 
            : "bg-btn-bg border-btn-border border-b-btn-border-b border-r-btn-border-r text-btn-text hover:text-btn-hover-text hover:bg-btn-hover-bg hover:border-t-btn-hover-border-t",
          className
        )}
        {...props}
      />
    );
  }
);"""
ui = ui.replace(old_solid_button, new_solid_button)

with open("src/components/ui.tsx", "w") as f:
    f.write(ui)
print("done")
