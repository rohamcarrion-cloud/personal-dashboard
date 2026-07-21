import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const Breadcrumbs = ({ items }) => {
  return (
    <nav className="flex items-center text-sm text-muted-foreground mb-8 overflow-x-auto whitespace-nowrap pb-2">
      <Link to="/" className="hover:text-foreground transition-colors flex items-center">
        <Home className="w-4 h-4" />
      </Link>
      
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <ChevronRight className="w-4 h-4 mx-2 shrink-0 opacity-50" />
          {item.href ? (
            <Link to={item.href} className="hover:text-foreground transition-colors truncate max-w-[150px] sm:max-w-xs">
              {item.label}
            </Link>
          ) : (
            <span className="text-foreground font-medium truncate max-w-[200px] sm:max-w-md">
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumbs;