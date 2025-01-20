import * as Accordion from '@radix-ui/react-accordion';
import './FAQ.css';
import { ChevronDownIcon } from '@radix-ui/react-icons';

export const FAQ = () => {
  return (
    <Accordion.Root className='accordion-root' type='multiple'>
      <Accordion.Item className='accordion-item' value='item-1'>
        <Accordion.Header className='accordion-header'>
          <Accordion.Trigger className='accordion-trigger'>
            Item 1
            <ChevronDownIcon className='accordion-chevron' aria-hidden />
          </Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content className='accordion-content'>
          This is the content for item 1.
        </Accordion.Content>
      </Accordion.Item>

      <Accordion.Item className='accordion-item' value='item-2'>
        <Accordion.Header className='accordion-header'>
          <Accordion.Trigger className='accordion-trigger'>
            Item 2
            <ChevronDownIcon className='accordion-chevron' aria-hidden />
          </Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content className='accordion-content'>
          This is the content for item 2.
        </Accordion.Content>
      </Accordion.Item>
    </Accordion.Root>
  );
};
