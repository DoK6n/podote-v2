import { InputType } from '@nestjs/graphql';
import { DocumentIdInput } from './document-id.input';

@InputType()
export class RemoveDocumentInput extends DocumentIdInput {}
