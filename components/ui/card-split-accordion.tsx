'use client';

import React, { useState, type FC } from 'react';
import { motion, MotionConfig, type Transition } from 'motion/react';
import { ChevronDown, Send } from 'lucide-react';
import { HiCursorArrowRipple } from 'react-icons/hi2';
import { Layers } from 'lucide-react';
import { IoIosTimer } from 'react-icons/io';
import { PiHandTap } from 'react-icons/pi';
import useMeasure from 'react-use-measure';

export interface AccordionItemData {
  id: number;
  title: string;
  icon: React.ReactNode;
  content: string;
}

interface AccordionItemProps {
  item: AccordionItemData;

  setOpenId: (id: number | null) => void;
  index: number;
  total: number;
  openIndex: number;
}
interface AccordionProps {
  items?: AccordionItemData[];
}

const springTransition: Transition = {
  type: 'spring',
  stiffness: 600,
  damping: 50,
  mass: 1,
};

const DEFAULT_ITEMS: AccordionItemData[] = [
  {
    id: 1,
    title: 'Win Rate & Profit Factor',
    icon: <HiCursorArrowRipple className="size-3 -rotate-10 md:size-4" />,
    content:
      'Win Rate is the percentage of trades that are profitable. Profit Factor is the gross profit divided by gross loss. A factor above 1.0 indicates a profitable system.',
  },
  {
    id: 2,
    title: 'Expectancy',
    icon: <Layers size={24} />,
    content:
      'Expectancy is the average amount you expect to win (or lose) per trade. It combines both your win rate and your average risk-to-reward ratio.',
  },
  {
    id: 3,
    title: 'Prop Firm Drawdown',
    icon: <PiHandTap size={26} className="-rotate-20" />,
    content:
      'Prop firms usually track a Daily Loss Limit (calculated from midnight equity) and a Max Drawdown (static or trailing from peak equity). Breach either and you lose the account.',
  },
  {
    id: 4,
    title: 'Trailing vs. Static',
    icon: <Send size={24} />,
    content:
      'A static drawdown floor never moves. A trailing drawdown floor moves up as your account balance reaches new peaks, locking in your risk.',
  },
  {
    id: 5,
    title: 'Journaling Routine',
    icon: <IoIosTimer size={26} />,
    content:
      'Log every trade with a setup tag and notes. Review your Dashboard heatmap and equity curve weekly to spot behavioral mistakes and edge deterioration.',
  },
];

const AccordionItem: FC<AccordionItemProps> = ({
  item,
  setOpenId,
  index,
  total,
  openIndex,
}) => {
  const [ref, bounds] = useMeasure();
  const isOpen = index === openIndex;

  const isFirst = index === 0;
  const isLast = index === total - 1;

  const isBeforeOpen = index === openIndex - 1;
  const isAfterOpen = index === openIndex + 1;

  const isAlone = (isAfterOpen && isLast) || (isBeforeOpen && isFirst);

  const BORDER_WIDTH = '1px';
  const BORDER_STYLE = 'solid';
  const borderTopWidth =
    isFirst || isAfterOpen || isOpen ? BORDER_WIDTH : '0px';
  const borderBottomWidth =
    isLast || isBeforeOpen || isOpen ? BORDER_WIDTH : '0px';
  const borderLeftWidth = BORDER_WIDTH;
  const borderRightWidth = BORDER_WIDTH;

  let borderTopLeftRadius = 0;
  let borderTopRightRadius = 0;
  let borderBottomLeftRadius = 0;
  let borderBottomRightRadius = 0;

  if (isOpen || isAlone) {
    borderTopLeftRadius = 20;
    borderTopRightRadius = 20;
    borderBottomLeftRadius = 20;
    borderBottomRightRadius = 20;
  } else if (isBeforeOpen) {
    borderBottomLeftRadius = 20;
    borderBottomRightRadius = 20;
  } else if (isAfterOpen) {
    borderTopLeftRadius = 20;
    borderTopRightRadius = 20;
  } else if (isFirst) {
    borderTopLeftRadius = 20;
    borderTopRightRadius = 20;
  } else if (isLast) {
    borderBottomLeftRadius = 20;
    borderBottomRightRadius = 20;
  }

  return (
    <MotionConfig transition={springTransition}>
      <motion.li layout>
        <motion.div
          animate={{
            borderTopLeftRadius,
            borderTopRightRadius,
            borderBottomLeftRadius,
            borderBottomRightRadius,
          }}
          className="overflow-hidden border-solid border-[var(--color-border)] bg-[var(--color-surface)] will-change-transform"
          style={{
            borderTopWidth,
            borderBottomWidth,
            borderLeftWidth,
            borderRightWidth,
            borderStyle: BORDER_STYLE,
            marginBlock: isOpen ? '10px' : '0px',
          }}
        >
          <button
            onClick={() => setOpenId(isOpen ? null : item.id)}
            className="flex w-full cursor-pointer items-center justify-between px-[12px] py-[10px]"
          >
            <div className="flex items-center gap-[12px]">
              {item.icon}

              <span className="text-sm font-bold text-[var(--color-text)] md:text-lg">
                {item.title}
              </span>
            </div>

            <motion.div animate={{ rotate: isOpen ? 180 : 0 }}>
              <ChevronDown className="size-5 text-[var(--color-muted)] md:size-[1.625rem]" />
            </motion.div>
          </button>

          <motion.div
            initial={false}
            animate={{
              height: isOpen ? bounds.height : 0,
              opacity: isOpen ? 1 : 0,
            }}
            className="overflow-hidden will-change-transform"
          >
            <div ref={ref}>
              <div className="px-5 pb-5 text-xs font-medium text-[var(--color-muted)] md:text-[16px]">
                {item.content}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </motion.li>
    </MotionConfig>
  );
};

export const AccordionApp: FC<AccordionProps> = ({ items }) => {
  const defaultItems = items ?? DEFAULT_ITEMS;

  const [openId, setOpenId] = useState<number | null>(null);

  const openIndex = defaultItems.findIndex((item) => item.id === openId);

  return (
    <div className="flex w-full flex-col items-center justify-center p-6 transition-colors duration-500">
      <ul className="w-full max-w-[600px]">
        {defaultItems.map((item, index) => (
          <AccordionItem
            key={item.id}
            item={item}
            setOpenId={setOpenId}
            index={index}
            total={defaultItems.length}
            openIndex={openIndex}
          />
        ))}
      </ul>
    </div>
  );
};
