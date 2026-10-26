import { getEntriesUseCase } from "@/src/composition-root";
import { createEntriesHandler } from "@/src/http/create-entries-handler";

export const GET = createEntriesHandler(getEntriesUseCase);
