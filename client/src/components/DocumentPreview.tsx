import { useState, useEffect, useMemo, useRef, forwardRef, useImperativeHandle } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Assignment } from '@/types';
import { FileText, Bold, Italic, Underline, Download } from 'lucide-react';
import { DocumentHeader } from './DocumentHeader';
import { StudentInfoGrid } from './StudentInfoGrid';
import { Button } from './ui/button';
import { marked } from 'marked';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface DocumentPreviewProps {
  assignment: Assignment;
  isStreaming?: boolean;
  onUpdate?: (content: string) => void;
}

// Heuristic: Approx characters per A4 page with this font size/margins
// Adjust this based on testing. 2200 is a safe conservative estimate to avoid overflow at 12pt.
const CHARS_PER_PAGE = 2200;

export interface DocumentPreviewHandle {
  handleDownloadPDF: () => void;
}

export const DocumentPreview = forwardRef<DocumentPreviewHandle, DocumentPreviewProps>(({ assignment, isStreaming, onUpdate }, ref) => {
  const { user } = useAuth();
  const [parsedPages, setParsedPages] = useState<string[][]>([]);
  const [isDownloading, setIsDownloading] = useState(false);

  // Configure marked to not sanitize directly, we will use it for structure
  // marked.use({ breaks: true }); // Optional: interpret newlines as breaks

  // Split content into pages logic
  useEffect(() => {
    if (!assignment.content) {
      setParsedPages([]);
      return;
    }

    // 1. Parse Markdown to HTML
    const rawHtml = marked.parse(assignment.content, { async: false }) as string;

    // 2. Split by block-level elements
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = rawHtml;

    // Convert HTML collection to array of outerHTML strings
    const blocks = Array.from(tempDiv.children).map(child => child.outerHTML);

    const pagesList: string[][] = [];
    let currentPage: string[] = [];
    let currentCharCount = 0;

    blocks.forEach((block) => {
      // rough text length estimation
      const textLength = block.replace(/<[^>]*>/g, '').length;

      // Heuristic for page break
      if ((currentCharCount + textLength > CHARS_PER_PAGE) && (pagesList.length > 0 || currentPage.length > 0)) {
        pagesList.push(currentPage);
        currentPage = [block];
        currentCharCount = textLength;
      } else {
        currentPage.push(block);
        currentCharCount += textLength;
      }
    });

    if (currentPage.length > 0) {
      pagesList.push(currentPage);
    }

    setParsedPages(pagesList);

  }, [assignment.content]);

  const handleDownloadPDF = async () => {
    console.log('=== PDF Generation Started ===');

    // Query for pages
    const pages = document.querySelectorAll('.a4-page') as NodeListOf<HTMLElement>;
    console.log('Total .a4-page elements found:', pages.length);

    if (!pages || pages.length === 0) {
      console.error('No pages found!');
      alert('No pages found to export! Please ensure content is generated first.');
      return;
    }

    // Verify pages have content
    let hasContent = false;
    pages.forEach((page, idx) => {
      const textContent = page.textContent?.trim() || '';
      console.log(`Page ${idx + 1} text length:`, textContent.length);
      if (textContent.length > 0) hasContent = true;
    });

    if (!hasContent) {
      alert('No content found in pages. Please generate content first.');
      return;
    }

    setIsDownloading(true);

    try {
      // A4 dimensions
      const A4_WIDTH_MM = 210;
      const A4_HEIGHT_MM = 297;

      // Create PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      });

      let successfulPages = 0;

      // Process each page
      for (let i = 0; i < pages.length; i++) {
        const pageElement = pages[i];

        console.log(`\n--- Processing Page ${i + 1}/${pages.length} ---`);

        // Log element properties
        const rect = pageElement.getBoundingClientRect();
        console.log('Element rect:', {
          width: rect.width,
          height: rect.height,
          top: rect.top,
          left: rect.left
        });
        console.log('Element dimensions:', {
          offsetWidth: pageElement.offsetWidth,
          offsetHeight: pageElement.offsetHeight,
          scrollWidth: pageElement.scrollWidth,
          scrollHeight: pageElement.scrollHeight,
          clientWidth: pageElement.clientWidth,
          clientHeight: pageElement.clientHeight
        });

        // Check if page is in viewport and visible
        const isVisible = rect.width > 0 && rect.height > 0;
        console.log('Is visible:', isVisible);

        if (!isVisible) {
          console.warn(`Page ${i + 1} is not visible, attempting to force visibility...`);
          // Scroll element into view
          pageElement.scrollIntoView({ behavior: 'instant', block: 'center' });
          await new Promise(resolve => setTimeout(resolve, 100));
        }

        // Store original styles
        const originalStyles = {
          position: pageElement.style.position,
          visibility: pageElement.style.visibility,
          opacity: pageElement.style.opacity,
          transform: pageElement.style.transform
        };

        // Force visibility and proper positioning
        pageElement.style.position = 'relative';
        pageElement.style.visibility = 'visible';
        pageElement.style.opacity = '1';
        pageElement.style.transform = 'none';

        // Wait for styles to apply
        await new Promise(resolve => setTimeout(resolve, 50));

        console.log('Generating canvas...');

        // Get actual dimensions
        const elementWidth = pageElement.scrollWidth || pageElement.offsetWidth;
        const elementHeight = pageElement.scrollHeight || pageElement.offsetHeight;
        console.log(`Element dimensions: ${elementWidth}x${elementHeight}`);

        // Generate canvas with html2canvas
        const canvas = await html2canvas(pageElement, {
          scale: 2, // Higher quality
          useCORS: true,
          logging: false, // Reduce console noise
          backgroundColor: '#ffffff',
          width: elementWidth,
          height: elementHeight,
          windowWidth: elementWidth,
          windowHeight: elementHeight,
          x: 0,
          y: 0,
          scrollX: 0,
          scrollY: 0,
          foreignObjectRendering: false,
          imageTimeout: 0,
          removeContainer: false,
          allowTaint: true,
          onclone: (clonedDoc, clonedElement) => {
            console.log('Cloning document for page', i + 1);
            console.log('Cloned element:', clonedElement);

            // The clonedElement passed to onclone is the actual element being captured
            const targetElement = clonedElement as HTMLElement;

            if (targetElement) {
              // Force all visibility on the target element
              targetElement.style.visibility = 'visible';
              targetElement.style.opacity = '1';
              targetElement.style.display = 'block';
              targetElement.style.position = 'relative';

              // Ensure white background
              targetElement.style.backgroundColor = '#ffffff';

              // Make all text black
              targetElement.style.color = '#000000';

              // Process all child elements
              const allElements = targetElement.querySelectorAll('*');
              console.log(`Processing ${allElements.length} elements in cloned page`);

              allElements.forEach((el) => {
                const htmlEl = el as HTMLElement;

                // Force visibility
                htmlEl.style.visibility = 'visible';
                htmlEl.style.opacity = '1';

                // Check if element is hidden by display
                const computedStyle = clonedDoc.defaultView?.getComputedStyle(htmlEl);
                if (computedStyle && computedStyle.display === 'none') {
                  htmlEl.style.display = 'block';
                }

                // Force black text for better contrast
                htmlEl.style.color = '#000000';
                // Remove webkit text fill colors that might cause issues
                htmlEl.style.webkitTextFillColor = '#000000';
              });

              console.log('Clone processing complete');
            } else {
              console.warn(`Could not access cloned element for page ${i + 1}`);
            }
          }
        });

        // Restore original styles
        Object.assign(pageElement.style, originalStyles);

        console.log(`Canvas created: ${canvas.width}x${canvas.height}`);

        // DEBUG: Save first canvas as image to inspect
        if (i === 0) {
          try {
            const debugImgData = canvas.toDataURL('image/png');
            console.log('🔍 DEBUG: First canvas image data length:', debugImgData.length);
            console.log('🔍 DEBUG: First 100 chars:', debugImgData.substring(0, 100));

            // Download the debug image so user can see what's captured
            const debugLink = document.createElement('a');
            debugLink.download = 'debug-canvas-page1.png';
            debugLink.href = debugImgData;
            debugLink.click();
            console.log('🔍 DEBUG: Canvas image saved as debug-canvas-page1.png for inspection');
          } catch (debugError) {
            console.error('🔍 DEBUG: Failed to save debug canvas:', debugError);
          }
        }

        // Validate canvas
        if (canvas.width === 0 || canvas.height === 0) {
          console.error(`Canvas for page ${i + 1} has zero dimensions!`);
          continue;
        }

        // Verify canvas has content
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          console.error(`Could not get canvas context for page ${i + 1}`);
          continue;
        }

        // Check if canvas is blank
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        let hasPixels = false;
        for (let j = 0; j < data.length; j += 4) {
          // Check if pixel is not white
          if (data[j] < 250 || data[j + 1] < 250 || data[j + 2] < 250) {
            hasPixels = true;
            break;
          }
        }

        if (!hasPixels) {
          console.warn(`Canvas for page ${i + 1} appears to be blank!`);
          console.log('This might indicate an issue with content visibility or rendering');
        } else {
          console.log(`✓ Canvas for page ${i + 1} has content`);
        }

        // Convert to image
        console.log('Converting to image...');
        const imgData = canvas.toDataURL('image/jpeg', 1.0);

        // Validate image data
        if (!imgData || imgData === 'data:,' || imgData === 'data:image/jpeg;base64,') {
          console.error(`Image data for page ${i + 1} is empty or invalid!`);
          console.log('Image data preview:', imgData.substring(0, 50));
          continue;
        }

        console.log(`Image data size: ${imgData.length} characters`);

        // Add page to PDF
        if (successfulPages > 0) {
          pdf.addPage('a4', 'portrait');
        }

        // Calculate dimensions to maintain aspect ratio
        const canvasRatio = canvas.width / canvas.height;
        const a4Ratio = A4_WIDTH_MM / A4_HEIGHT_MM;

        let imgWidth = A4_WIDTH_MM;
        let imgHeight = A4_HEIGHT_MM;
        let xOffset = 0;
        let yOffset = 0;

        if (canvasRatio > a4Ratio) {
          imgHeight = A4_WIDTH_MM / canvasRatio;
          yOffset = (A4_HEIGHT_MM - imgHeight) / 2;
        } else {
          imgWidth = A4_HEIGHT_MM * canvasRatio;
          xOffset = (A4_WIDTH_MM - imgWidth) / 2;
        }

        console.log(`Adding image to PDF: pos(${xOffset}, ${yOffset}) size(${imgWidth}x${imgHeight})`);

        try {
          pdf.addImage(imgData, 'JPEG', xOffset, yOffset, imgWidth, imgHeight, undefined, 'FAST');
          successfulPages++;
          console.log(`✓ Page ${i + 1} added successfully`);
        } catch (addImageError) {
          console.error(`Failed to add image for page ${i + 1}:`, addImageError);
        }
      }

      console.log('\n=== PDF Generation Summary ===');
      console.log(`Successfully processed: ${successfulPages}/${pages.length} pages`);
      console.log(`Total pages in PDF: ${pdf.getNumberOfPages()}`);

      if (successfulPages === 0) {
        throw new Error('No pages were successfully added to the PDF');
      }

      // Save PDF
      const filename = `${assignment.subject || 'assignment'}_${user?.rollNumber || 'document'}.pdf`;
      console.log('Saving PDF as:', filename);
      pdf.save(filename);

      console.log('✓ PDF saved successfully');

    } catch (error) {
      console.error('=== PDF Generation Failed ===');
      console.error('Error details:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`PDF generation failed: ${errorMessage}\n\nPlease check the console for details.`);
    } finally {
      setIsDownloading(false);
    }
  };

  // Expose handleDownloadPDF to parent component via ref
  useImperativeHandle(ref, () => ({
    handleDownloadPDF
  }));


  // Simple Formatting Toolbar
  const FormattingToolbar = () => (
    <div className="flex items-center gap-1 border-l pl-4 ml-4 hidden sm:flex">
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => document.execCommand('bold')}
        title="Bold (Ctrl+B)"
      >
        <Bold className="h-3 w-3" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => document.execCommand('italic')}
        title="Italic (Ctrl+I)"
      >
        <Italic className="h-3 w-3" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => document.execCommand('underline')}
        title="Underline (Ctrl+U)"
      >
        <Underline className="h-3 w-3" />
      </Button>
    </div>
  );

  const handleParagraphBlur = (pageIndex: number, pIndex: number, newHtml: string) => {
    if (!onUpdate || !assignment.content) return;

    // Reconstruct content logic
    const allBlocks = parsedPages.flat();
    let globalIndex = 0;

    // Count blocks before current page
    for (let i = 0; i < pageIndex; i++) {
      globalIndex += parsedPages[i].length;
    }
    // Add index within current page
    globalIndex += pIndex;

    if (globalIndex >= 0 && globalIndex < allBlocks.length) {
      allBlocks[globalIndex] = newHtml;

      // Simplest: just join by newlines.
      const newContent = allBlocks.join('\n\n');
      onUpdate(newContent);
    }
  };

  // Split content into pages (Redundant for display but kept if needed for logic)
  const pages = useMemo(() => {
    // ... logic embedded in useEffect now
    return parsedPages;
  }, [parsedPages]);


  return (
    <div className="document-preview-container bg-card/50 backdrop-blur-sm rounded-2xl overflow-hidden shadow-lg border">
      {/* Preview Header */}
      <div className="px-4 py-3 border-b bg-gradient-to-r from-card/80 to-muted/50 backdrop-blur-sm flex items-center gap-2 no-print">
        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <FileText className="h-4 w-4 text-primary" />
        </div>
        <span className="text-sm font-semibold text-foreground">Document Preview</span>
        <span className="text-xs text-muted-foreground">(Editable)</span>

        {/* Formatting Toolbar */}
        {!isStreaming && <FormattingToolbar />}

        {/* Download Button */}
        {!isStreaming && (
          <Button
            variant="outline"
            size="sm"
            className="ml-auto flex items-center gap-2 h-8 shadow-sm hover:shadow-md transition-all"
            onClick={handleDownloadPDF}
            disabled={isDownloading}
          >
            <Download className="h-3.5 w-3.5" />
            <span className="text-xs font-medium">{isDownloading ? 'Generating...' : 'Download PDF'}</span>
          </Button>
        )}

        {isStreaming && (
          <span className="ml-auto text-xs text-primary animate-pulse flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse"></span>
            Generating...
          </span>
        )}
        {!isStreaming && (
          <span className="ml-2 text-xs text-muted-foreground hidden sm:inline border-l pl-3">
            {parsedPages.length} page{parsedPages.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Pages Container */}
      <div className="preview-content-wrapper p-4 sm:p-8 overflow-x-auto bg-gradient-to-b from-muted/10 to-muted/20 flex flex-col items-center">
        {parsedPages.length > 0 ? (
          parsedPages.map((pageBlocks, pageIndex) => (
            <div
              key={pageIndex}
              id={`page-${pageIndex + 1}`}
              className="a4-page group page-break transition-all hover:shadow-xl"
            >
              {/* Header on EVERY page */}
              <DocumentHeader />

              <div className="p-8 sm:p-12 pt-4 pb-0">
                {/* Student Details ONLY on First Page */}
                {pageIndex === 0 && (
                  <StudentInfoGrid assignment={assignment} />
                )}

                {/* Page Content */}
                <div className="document-preview text-justify text-base leading-relaxed" style={{ color: '#000', letterSpacing: '0.5px' }}>
                  <div className={isStreaming && pageIndex === parsedPages.length - 1 ? 'typing-cursor' : ''}>
                    {pageBlocks.map((htmlContent, pIndex) => (
                      <div
                        key={pIndex}
                        contentEditable={!isStreaming}
                        suppressContentEditableWarning
                        className="mb-4 indent-8 hover:bg-black/5 rounded px-1 transition-colors outline-none focus:bg-transparent focus:ring-1 focus:ring-primary/50"
                        style={{ color: '#000', letterSpacing: '0.5px' }}
                        onBlur={(e) => handleParagraphBlur(pageIndex, pIndex, e.currentTarget.innerHTML)}
                        dangerouslySetInnerHTML={{ __html: htmlContent }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Page Number Footer - Positioned in bottom margin */}
              <div className="absolute bottom-6 left-0 w-full text-center text-sm text-black font-serif">
                {pageIndex + 1}
              </div>
            </div>
          ))
        ) : (
          /* Empty State - Render Page 1 Structure */
          <div className="a4-page">
            <DocumentHeader />
            <div className="p-8 sm:p-12 pt-4 pb-0">
              <StudentInfoGrid assignment={assignment} />

              <div className="document-preview text-justify text-base leading-relaxed min-h-[500px] flex items-center justify-center">
                <div className="text-center text-gray-400 italic">
                  Content generation pending...
                </div>
              </div>
            </div>

            {/* Page Number Footer - Positioned in bottom margin */}
            <div className="absolute bottom-6 left-0 w-full text-center text-sm text-black font-serif">
              1
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

DocumentPreview.displayName = 'DocumentPreview';
