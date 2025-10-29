"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronRight } from "lucide-react";

const SidebarContext = createContext(undefined);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) throw new Error("useSidebar must be used within a SidebarProvider");
  return context;
};

export const SidebarProvider = ({ children }) => {
  const [open, setOpen] = useState(true);

  return (
    <SidebarContext.Provider value={{ open, setOpen }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const Sidebar = ({ children, className }) => {
  const { open } = useSidebar();

  return (
    <motion.aside
      animate={{ width: open ? 240 : 80 }}
      className={cn(
        "relative flex flex-col border-r bg-background transition-all duration-300 ease-in-out",
        className
      )}
    >
      {children}
    </motion.aside>
  );
};

export const SidebarHeader = ({ children, className }) => (
  <div className={cn("flex items-center justify-between p-4", className)}>
    {children}
  </div>
);

export const SidebarContent = ({ children, className }) => (
  <div className={cn("flex-1 overflow-y-auto", className)}>{children}</div>
);

export const SidebarFooter = ({ children, className }) => (
  <div className={cn("p-4 border-t", className)}>{children}</div>
);

export const SidebarToggle = ({ className }) => {
  const { open, setOpen } = useSidebar();
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setOpen(!open)}
      className={cn("absolute -right-3 top-6 z-20 rounded-full border", className)}
    >
      <motion.div animate={{ rotate: open ? 180 : 0 }}>
        <ChevronRight className="h-4 w-4" />
      </motion.div>
    </Button>
  );
};

export const SidebarMenu = ({ children, className }) => (
  <nav className={cn("space-y-1 px-2", className)}>{children}</nav>
);

export const SidebarMenuItem = ({ children, className }) => (
  <div className={cn("relative", className)}>{children}</div>
);

export const SidebarMenuButton = React.forwardRef(
  ({ asChild = false, isActive = false, tooltip, children, className, ...props }, ref) => {
    const { open } = useSidebar();
    const Comp = asChild ? React.Fragment : "button";

    const content = (
      <Comp
        ref={ref}
        className={cn(
          "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
          isActive && "bg-accent text-accent-foreground",
          className
        )}
        {...props}
      >
        {children}
      </Comp>
    );

    return open ? (
      content
    ) : (
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
          {tooltip && <TooltipContent side="right">{tooltip}</TooltipContent>}
        </Tooltip>
      </TooltipProvider>
    );
  }
);
SidebarMenuButton.displayName = "SidebarMenuButton";

export const SidebarMenuSub = ({ children, className }) => (
  <div className={cn("ml-6 border-l pl-2", className)}>{children}</div>
);

export const SidebarMenuSubItem = ({ children, className }) => (
  <div className={cn("py-1", className)}>{children}</div>
);

export const SidebarCollapsible = ({ title, children, icon: Icon, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const { open } = useSidebar();

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <SidebarMenuButton className="justify-between">
          <div className="flex items-center gap-2">
            {Icon && <Icon className="h-4 w-4" />}
            {open && <span>{title}</span>}
          </div>
          <AnimatePresence initial={false}>
            {open && (
              <motion.div
                animate={{ rotate: isOpen ? 90 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronRight className="h-4 w-4" />
              </motion.div>
            )}
          </AnimatePresence>
        </SidebarMenuButton>
      </CollapsibleTrigger>
      <AnimatePresence>
        {isOpen && (
          <CollapsibleContent asChild>
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: "auto" }}
              exit={{ height: 0 }}
              className="overflow-hidden"
            >
              <SidebarMenuSub>{children}</SidebarMenuSub>
            </motion.div>
          </CollapsibleContent>
        )}
      </AnimatePresence>
    </Collapsible>
  );
};

export const SidebarGroup = ({ children, className }) => (
  <div className={cn("space-y-2", className)}>{children}</div>
);

export const SidebarGroupLabel = ({ children, className }) => (
  <h4 className={cn("px-3 text-xs font-semibold uppercase text-muted-foreground", className)}>
    {children}
  </h4>
);
